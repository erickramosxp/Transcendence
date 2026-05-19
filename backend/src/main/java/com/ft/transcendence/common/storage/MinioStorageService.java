package com.ft.transcendence.common.storage;

import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.http.Method;
import io.minio.messages.Item;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.InputStream;

@ApplicationScoped
public class MinioStorageService implements StorageService {

    @Inject
    private MinioClient minioClient;

    @ConfigProperty(name = "minio.bucket-name")
    private String bucket;

    @ConfigProperty(name = "minio.access-key")
    private String accessKey;

    @ConfigProperty(name = "minio.secret-key")
    private String secretKey;

    @ConfigProperty(name = "minio.public-url")
    private String minioPublicUrl;

    // Cliente separado para gerar presigned URLs com o host público (localhost:9000)
    // O minioClient principal usa o host interno (minio-dev:9000) para operações de upload/download.
    // Se ambos usarem o mesmo host, a assinatura da URL não bate com o host acessado pelo browser.
    private MinioClient publicMinioClient;

    @PostConstruct
    void initPublicClient() {
        publicMinioClient = MinioClient.builder()
                .endpoint(minioPublicUrl)
                .credentials(accessKey, secretKey)
                .build();
    }

    void onStart(@Observes StartupEvent ev) {
        try {
            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build()
            );

            if (!found) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucket).build()
                );
            }
        } catch (Exception e) {
            System.err.println("Fail to check bucket: " + e.getMessage());
        }
    }

    @Override
    public String upload(String path, InputStream stream, long size, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .stream(stream, size, -1)
                            .contentType(contentType)
                            .build()
            );
            return path;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public InputStream download(String path) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public InputStream view(String path) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );

            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );
        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                return;
            }
            throw new RuntimeException(e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteByPrefix(String prefix) {
        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(bucket)
                        .prefix(prefix)
                        .recursive(true)
                        .build()
        );

        for (Result<Item> result : results) {
            try {
                Item item = result.get();

                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucket)
                                .object(item.objectName())
                                .build()
                );
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    public String generateUrl(String path) {
        // Dev: bucket público, URL direta sem assinatura.
        // Prod: bucket privado, usa presigned URL com HTTPS.
        if (minioPublicUrl.startsWith("http://")) {
            return minioPublicUrl + "/" + bucket + "/" + path;
        }
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(path)
                            .expiry(60 * 60)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}