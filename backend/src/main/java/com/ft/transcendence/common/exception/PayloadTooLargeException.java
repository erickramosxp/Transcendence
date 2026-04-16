package com.ft.transcendence.common.exception;

import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.core.Response;

public class PayloadTooLargeException extends ClientErrorException {

    public PayloadTooLargeException(String message) {
        super(message, Response.Status.REQUEST_ENTITY_TOO_LARGE);
    }
}
