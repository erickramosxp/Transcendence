package com.ft.transcendence.common.errors;

import com.ft.transcendence.common.exception.PayloadTooLargeException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class PayloadTooLargeMapper implements ExceptionMapper<PayloadTooLargeException> {
    @Override
    public Response toResponse(PayloadTooLargeException e) {
        var body = new java.util.HashMap<String, Object>();
        body.put("code", "REQUEST_ENTITY_TOO_LARGE");
        body.put("message", e.getMessage());

        return Response.status(Response.Status.REQUEST_ENTITY_TOO_LARGE)
                .type(MediaType.APPLICATION_JSON)
                .entity(body)
                .build();
    }
}
