package com.ft.transcendence.job.handlers;

import com.ft.transcendence.common.storage.StorageService;
import com.ft.transcendence.job.JobPayloads.ProcessVideoPayload;
import com.ft.transcendence.media.domain.Media;
import com.ft.transcendence.media.enums.MediaStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.io.File;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@ApplicationScoped
public class ProcessVideoHandler {

    @Inject
    StorageService storageService;

    @Transactional
    public void handle(ProcessVideoPayload payload) throws Exception {

        Media media = Media.findById(payload.mediaId);

        if (media == null) {
            throw new IllegalArgumentException("Media not founded: " + payload.mediaId);
        }

        File tempOriginal = File.createTempFile("video_orig_" + media.id, ".mp4");
        File tempCompressed = File.createTempFile("video_comp_" + media.id, ".mp4");
        File tempPreview = File.createTempFile("preview_" + media.id, ".jpg");;
        File tempBlur = File.createTempFile("blur_" + media.id, ".jpg");

        try {

            try (InputStream is = storageService.download(payload.path)){
                Files.copy(is, tempOriginal.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }

            compressVideo(tempOriginal, tempCompressed);

            int width = Integer.parseInt(getVideoMetadata(tempCompressed, "stream=width", "v:0"));
            int height = Integer.parseInt(getVideoMetadata(tempCompressed, "stream=height", "v:0"));
            double duration = Double.parseDouble(getVideoMetadata(tempCompressed, "format=duration", null));

            extractFrames(tempCompressed, tempPreview, tempBlur);

            String basePath = payload.path.substring(0, payload.path.lastIndexOf("/") + 1);
            String compressedPath = basePath + "compressed_" + UUID.randomUUID() + ".mp4";
            String previewPath = basePath + "preview_" + UUID.randomUUID() + ".jpg";
            String blurPath = basePath + "blur_" + UUID.randomUUID() + ".jpg";

            try (InputStream is = Files.newInputStream(tempCompressed.toPath())) {
                storageService.upload(compressedPath, is, tempCompressed.length(), "video/mp4");
            }
            try (InputStream is = Files.newInputStream(tempPreview.toPath())) {
                storageService.upload(previewPath, is, tempPreview.length(), "image/jpeg");
            }
            try (InputStream is = Files.newInputStream(tempBlur.toPath())) {
                storageService.upload(blurPath, is, tempBlur.length(), "image/jpeg");
            }

            storageService.delete(payload.path);

            media.pathOriginal = compressedPath;
            media.pathPreview = previewPath;
            media.pathBlur = blurPath;
            media.width = width;
            media.height = height;
            media.duration = BigDecimal.valueOf(duration);
            media.status = MediaStatus.COMPLETED;
            media.persist();

        } finally {
            tempOriginal.delete();
            tempCompressed.delete();
            tempPreview.delete();
            tempBlur.delete();
        }
    }

    private void compressVideo(File input, File output) throws Exception {
        // scale='min(1280,iw)':'min(720,ih)' garante que vídeos em 4k caiam para 720p,
        // -crf 28 balanço entre qualidade e tamanho minúsculo para web.
        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-y",
                "-i", input.getAbsolutePath(),
                "-vf", "scale=min(1280\\,iw):min(720\\,ih):force_original_aspect_ratio=decrease",
                "-crf", "28",
                "-preset", "fast",
                "-c:v", "libx264",
                "-c:a", "aac",
                "-b:a", "128k",
                output.getAbsolutePath()
        );
        runProcess(pb, 180); // Compressão demora mais, permitindo até 3 minutos
    }


    private void extractFrames(File videoIn, File previewOut, File blurOut) throws Exception {
        // Comando FFmpeg para extrair a thumbnail normal
        ProcessBuilder previewPb = new ProcessBuilder(
                "ffmpeg", "-y",
                "-i", videoIn.getAbsolutePath(),
                "-ss", "00:00:00.5",
                "-vframes", "1",
                previewOut.getAbsolutePath()
        );
        runProcess(previewPb, 30);

        // Comando FFmpeg para extrair o Blur (diminui tamanho e borra bastante)
        ProcessBuilder blurPb = new ProcessBuilder(
                "ffmpeg", "-y",
                "-i", videoIn.getAbsolutePath(),
                "-ss", "00:00:00.5",
                "-vframes", "1",
                "-vf", "scale=64:-2,boxblur=2:1",
                blurOut.getAbsolutePath()
        );
        runProcess(blurPb, 30);
    }

    private String getVideoMetadata(File file, String entry, String streamType) throws Exception {
        // Comando FFprobe: extrai apenas o valor que queremos
        List<String> command = new ArrayList<>(Arrays.asList(
                "ffprobe", "-v", "error",
                "-show_entries", entry,
                "-of", "default=nw=1:nk=1"
        ));
        if (streamType != null) {
            command.add("-select_streams");
            command.add(streamType);
        }
        command.add(file.getAbsolutePath());

        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();

        // Lê a resposta do comando
        String result = new String(process.getInputStream().readAllBytes()).trim();
        process.waitFor(10, TimeUnit.SECONDS);

        return result;
    }

    private void runProcess(ProcessBuilder pb, int timeoutSeconds) throws Exception {
        pb.redirectErrorStream(true);
        Process process = pb.start();

        String logs = new String(process.getInputStream().readAllBytes());

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS); // Timeout de segurança

        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("FFmpeg timeout.\nLogs:\n" + logs);
        }

        int exitCode = process.exitValue();

        if (exitCode != 0) {
            throw new RuntimeException( "Falha ao rodar FFmpeg.\n" +
                    "Código: " + exitCode + "\n\n" +
                    "Logs:\n" + logs);
        }
    }
}
