package com.ft.transcendence.realtime.ws;

import com.ft.transcendence.realtime.ws.dto.AuthenticatedSocketUser;
import jakarta.ws.rs.NotAuthorizedException;
import org.eclipse.microprofile.jwt.JsonWebToken;

import io.quarkus.websockets.next.WebSocketConnection;
import io.smallrye.jwt.auth.principal.JWTParser;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@ApplicationScoped
public class WsAuthService {

    @Inject
    JWTParser jwtParser;

    public AuthenticatedSocketUser authenticate(WebSocketConnection connection) {
        String query = connection.handshakeRequest().query();
        String token = getQueryParam(query, "token");

        if (token == null || token.isBlank())
            throw new NotAuthorizedException("Missing token");

        try {
            JsonWebToken jwt = jwtParser.parse(token);

            Object uidClaim = jwt.getClaim("uid");
            if (uidClaim == null)
                throw new ForbiddenException("Invalid token: missing uid");

            Long userId = Long.valueOf(uidClaim.toString());

            return AuthenticatedSocketUser.of(userId, jwt.getName(), jwt.getSubject());
        } catch (ForbiddenException e) {
            throw e;
        } catch (Exception e) {
            throw new ForbiddenException("Invalid token");
        }
    }

    public static String getQueryParam(String query, String key) {
        if (query == null || query.isBlank())
            return null;

        return Arrays.stream(query.split("&"))
                .map(param -> param.split("=", 2))
                .filter(pair -> pair.length == 2 && pair[0].equals(key))
                .map(pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8))
                .findFirst()
                .orElse(null);
    }
}