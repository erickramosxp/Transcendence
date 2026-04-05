package com.ft.transcendence.post.dto;

import org.jboss.resteasy.reactive.multipart.FileUpload;
import org.jboss.resteasy.reactive.RestForm;

public class CreatePostForm {

    @RestForm
    public String text;

    @RestForm
    public String fileType;

    @RestForm
    public FileUpload file;

    @RestForm
    public String linkPreview; // JSON string
}
