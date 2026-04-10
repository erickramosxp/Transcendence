package com.ft.transcendence.common.storage;

import io.minio.*;
import io.minio.errors.ErrorResponseException;
import io.minio.http.Method;
import io.minio.messages.Item;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.InputStream;

@ApplicationScoped
public class MinioStorageService implements StorageService {

    @Inject
    private MinioClient minioClient;

    @ConfigProperty(name = "quarkus.minio.bucket-name")
    private String bucket;

    void onStart(@Observes StartupEvent ev) {
        // Criar bucket se não existir
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
            // Download the file from MinIO
            InputStream stream = minioClient.getObject( //(2)
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );
            return stream;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public InputStream view(String path) {
        try {
            // 1. Pergunta ao MinIO os metadados do arquivo (para descobrir se é png, jpg, etc)
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );

            // 2. Pega o fluxo de dados (a imagem em si)
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucket)
                            .object(path)
                            .build()
            );

            // 3. Retorna o stream com o Tipo de Conteúdo correto e a disposição "inline"
            return stream;

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
                return; // arquivo não existe
            }
            throw new RuntimeException(e);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    // users/1/posts/10/images/b.png
    // deleteByPrefix("users/1/posts/10/");
    // deleteByPrefix("users/1/posts/10/comments/5/");
    // deleteByPrefix("users/{userId}/posts/{postId}/");
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
        try {
            String url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(path)
                            .expiry(60 * 60) // 1 hora
                            .build()
            );
            return url;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}