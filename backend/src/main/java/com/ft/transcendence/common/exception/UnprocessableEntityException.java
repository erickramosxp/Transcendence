package com.ft.transcendence.common.exception;

import jakarta.ws.rs.ClientErrorException;

public class UnprocessableEntityException extends ClientErrorException {

    public UnprocessableEntityException(String message) {
        super(message, 422);
    }
}
