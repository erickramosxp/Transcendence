package com.ft.transcendence.common.storage;

import java.io.InputStream;

public interface StorageService {
    String upload(String path, InputStream stream, String contentType);
    InputStream download(String path);
    InputStream view(String path);
    void delete(String path);
    void deleteByPrefix(String prefix);
    String generateUrl(String path);
}