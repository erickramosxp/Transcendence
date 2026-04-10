package com.ft.transcendence.common.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.tika.Tika;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

@ApplicationScoped
public class MediaValidationService {

    private static final Set<String> VALID_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private static final Set<String> VALID_VIDEO_TYPES = Set.of(
            "video/mp4",
            "video/quicktime"
    );

    private static final long IMAGE_LIMIT = 5L * 1024 * 1024;
    private static final long VIDEO_LIMIT = 20L * 1024 * 1024;

    private final Tika tika = new Tika();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MediaAnalysis analyzeImage(Path path) throws Exception {
        String mimeType = tika.detect(path);
        return analyzeImage(path, mimeType);
    }

    public MediaAnalysis analyzeImage(Path path, String mimeType) throws Exception {

        if (path == null || !Files.exists(path)) {
            return new MediaAnalysis(false, "File not found", null, MediaKind.NOT_FOUNDED);
        }

        long size = Files.size(path);
        if (size > IMAGE_LIMIT) {
            return new MediaAnalysis(false, "Image too large", null, MediaKind.TOO_LARGE);
        }

        if (!VALID_IMAGE_TYPES.contains(mimeType)) {
            return new MediaAnalysis(false, "Invalid image type", mimeType, MediaKind.UNKNOWN);
        }

        if (!isValidImage(path)) {
            return new MediaAnalysis(false, "Invalid image content", mimeType, MediaKind.NOT_FOUNDED);
        }

        return new MediaAnalysis(true, null, mimeType, MediaKind.IMAGE);
    }

    public MediaAnalysis analyzeVideo(Path path, String mimeType) throws Exception {

        if (path == null || !Files.exists(path)) {
            return new MediaAnalysis(false, "File not found", null, MediaKind.NOT_FOUNDED);
        }

        long size = Files.size(path);
        if (size > VIDEO_LIMIT) {
            return new MediaAnalysis(false, "Video too large", null, MediaKind.TOO_LARGE);
        }

        if (!VALID_VIDEO_TYPES.contains(mimeType)) {
            return new MediaAnalysis(false, "Invalid video type", mimeType, MediaKind.UNKNOWN);
        }

        StreamKind streamKind = detectStreamKind(path);

        if (streamKind == StreamKind.AUDIO_ONLY) {
            return new MediaAnalysis(true, null, mimeType, MediaKind.AUDIO);
        }

        if (streamKind == StreamKind.VIDEO_ONLY || streamKind == StreamKind.AUDIO_VIDEO) {
            return new MediaAnalysis(true, null, mimeType, MediaKind.VIDEO);
        }

        return new MediaAnalysis(false, "Invalid video content", mimeType, MediaKind.NOT_FOUNDED);
    }

    public MediaAnalysis analyzePostFile(Path path) throws Exception {

        String mimeType = tika.detect(path);
        if (VALID_IMAGE_TYPES.contains(mimeType)) {
            return analyzeImage(path, mimeType);
        }

        if (VALID_VIDEO_TYPES.contains(mimeType)) {
            return analyzeVideo(path, mimeType);

        }
        return new MediaAnalysis(false, "Invalid file type", mimeType, MediaKind.UNKNOWN);
    }

    private StreamKind detectStreamKind(Path path) throws Exception {

        ProcessBuilder pb = new ProcessBuilder(
          "ffprobe",
          "-v", "error",
          "-show_entries", "stream=codec_type",
          "-of", "json",
          path.toAbsolutePath().toString()
        );
        pb.redirectErrorStream(true);


        Process process = pb.start();
        process.getOutputStream().close();

        boolean finished = process.waitFor(3, java.util.concurrent.TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            System.out.println("ffprobe timeout");
            return StreamKind.UNKNOWN;
        }

        String output = new String(process.getInputStream().readAllBytes());
        int exit = process.exitValue();


        if (exit != 0) {
            return StreamKind.UNKNOWN;
        }

        JsonNode root = objectMapper.readTree(output);
        JsonNode streams = root.path("streams");

        boolean hasAudio = false;
        boolean hasVideo = false;

        for (JsonNode stream : streams) {
            String codecType = stream.path("codec_type").asText();

            if ("audio".equals(codecType))
                hasAudio = true;
            if ("video".equals(codecType))
                hasVideo = true;
        }

        if (hasAudio && hasVideo) return StreamKind.AUDIO_VIDEO;
        if (hasVideo) return StreamKind.VIDEO_ONLY;
        if (hasAudio) return StreamKind.AUDIO_ONLY;
        return StreamKind.UNKNOWN;
    }

    private enum StreamKind {
        AUDIO_ONLY,
        VIDEO_ONLY,
        AUDIO_VIDEO,
        UNKNOWN
    }

    public boolean isValidImage(Path path) {
        try (InputStream is = Files.newInputStream(path)) {
            BufferedImage img = ImageIO.read(is);
            return img != null;
        } catch (Exception e) {
            return false;
        }
    }
}
