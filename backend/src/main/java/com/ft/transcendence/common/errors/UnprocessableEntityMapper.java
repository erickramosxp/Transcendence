package com.ft.transcendence.common.errors;

import com.ft.transcendence.common.exception.UnprocessableEntityException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class UnprocessableEntityMapper implements ExceptionMapper<UnprocessableEntityException> {
    @Override
    public Response toResponse(UnprocessableEntityException e) {
        var body = new java.util.HashMap<String, Object>();
        body.put("code", "UNPROCESSABLE_ENTITY");
        body.put("message", e.getMessage());

        return Response.status(422)
                .type(MediaType.APPLICATION_JSON)
                .entity(body)
                .build();
    }
}
