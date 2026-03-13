<<<<<<<< HEAD:backend/src/main/java/com/ft/transcendence/auth/errors/maps/BadRequestMapper.java
package com.ft.transcendence.auth.errors.maps;
========
package com.ft.transcendence.common.errors;
>>>>>>>> main:backend/src/main/java/com/ft/transcendence/common/errors/BadRequestMapper.java

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class BadRequestMapper implements ExceptionMapper<BadRequestException> {
    @Override
    public Response toResponse(BadRequestException e) {
        var body = new java.util.HashMap<String, Object>();
        body.put("code", "BAD_REQUEST");
        body.put("message", e.getMessage());

        return Response.status(Response.Status.BAD_REQUEST)
                .type(MediaType.APPLICATION_JSON)
                .entity(body)
                .build();
    }
}
