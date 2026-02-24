package com.ft.transcendence.auth;

import com.ft.transcendence.auth.dto.AuthResponse;
import com.ft.transcendence.entity.AuthProvider;
import com.ft.transcendence.entity.AuthProviderType;
import com.ft.transcendence.entity.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.text.Normalizer;
import java.util.Locale;

@ApplicationScoped
public class GoogleAuthService {

    private final GoogleIdTokenVerifier verifier;

    @Inject
    public GoogleAuthService(@ConfigProperty(name = "google.oauth.web-client-id") String clientId) {
        if (clientId == null || clientId.isBlank())
            throw new IllegalStateException("google.oauth.web-client-id not configured");

        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .setIssuer("https://accounts.google.com")
                .build();
    }

    @Transactional
    public AuthResponse loginOrRegisterWithGoogle(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank())
            throw new BadRequestException("ID Token is required");

        GoogleIdToken.Payload payload = verifyGoogleToken(idTokenString);

        OffsetDateTime now = OffsetDateTime.now();
        User user = findOrCreateUser(payload, now);


        user.lastLogin = now;
        user.updatedAt = now;

        String token = Jwt
                .upn(user.email)
                .claim("uid", user.id)
                .sign();

        return AuthResponse.of(token, user);
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        GoogleIdToken idToken;

        try {
            idToken = verifier.verify(idTokenString);
        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            throw new NotAuthorizedException("Failed to validate Google token");
        }

        if (idToken == null)
            throw new NotAuthorizedException("Invalid or expired ID token");

        return idToken.getPayload();
    }

    private User findOrCreateUser(GoogleIdToken.Payload payload, OffsetDateTime now) {
        String sub = payload.getSubject();
        String email = payload.getEmail();
        boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());

        if (email == null || email.isBlank())
            throw new BadRequestException("Google account does not have email");
        if (!emailVerified)
            throw new BadRequestException("The email address associated with the Google account is not verified");

        String normalizedEmail = email.trim().toLowerCase();

        AuthProvider existingGoogleProvider = AuthProvider.find(
                "providerType = ?1 and providerUserId = ?2",
                AuthProviderType.GOOGLE, sub).firstResult();

        User user;
        if (existingGoogleProvider != null) {
            user = existingGoogleProvider.user;
        } else {
            user = User.find("email", normalizedEmail).firstResult();
            if (user == null) {
                user = new User();
                user.email = normalizedEmail;
                user.username = generateUsername(normalizedEmail);
                user.name = (String) payload.get("name");
                user.active = true;
                user.createdAt = now;
                user.updatedAt = now;
                user.persist();
            }
            linkGoogleProvider(user, sub, now);
        }

        return user;
    }

    private void linkGoogleProvider(User user, String sub, OffsetDateTime now) {
        var provider = new AuthProvider();
        provider.user = user;
        provider.providerType = AuthProviderType.GOOGLE;
        provider.providerUserId = sub;
        provider.createdAt = now;
        provider.persist();
    }

    private static String generateUsername(String email) {
        if (email == null)
            return "user";

        int at = email.indexOf('@');
        String local = (at >= 0 ? email.substring(0, at) : email).trim();
        if (local.isEmpty())
            return "user";

        local = Normalizer.normalize(local, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");

        String base = local.toLowerCase(Locale.ROOT)
                        .replaceAll("[^a-z0-9._]+", ".")
                        .replaceAll("\\.+", ".")
                        .replaceAll("^[._]+|[._]+$", "");
        String username = base;
        int suffix = 1;
        while (User.find("username", username).firstResult() != null) {
            username = base + suffix++;
        }
        return username;
    }
}
