package com.ft.transcendence.common.storage;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.InputStream;

public class FileUploadForm {

    @RestForm
    public FileUpload file;
}
