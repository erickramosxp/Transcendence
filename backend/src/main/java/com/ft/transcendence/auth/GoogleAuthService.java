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

        GoogleIdToken idToken;

        try {
            idToken = verifier.verify(idTokenString);
        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            throw new NotAuthorizedException("Failed to validate Google token");
        }

        if (idToken == null)
            throw new NotAuthorizedException("Invalid or expired ID token");

        GoogleIdToken.Payload payload = idToken.getPayload();

        String sub = payload.getSubject();
        String email = payload.getEmail();
        Boolean emailVerified = (Boolean) payload.get("email_verified");

        if (email == null || email.isBlank())
            throw new BadRequestException("Google account does not have email");
        if (emailVerified == null || !emailVerified)
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
                OffsetDateTime now = OffsetDateTime.now();
                user.createdAt = now;
                user.updatedAt = now;
                user.persist();

                AuthProvider googleProvider = new AuthProvider();
                googleProvider.user = user;
                googleProvider.providerType = AuthProviderType.GOOGLE;
                googleProvider.providerUserId = sub;
                googleProvider.passwordHash = null;
                googleProvider.createdAt = now;
                googleProvider.persist();
            } else {
                OffsetDateTime now = OffsetDateTime.now();

                AuthProvider googleProvider = new AuthProvider();
                googleProvider.user = user;
                googleProvider.providerType = AuthProviderType.GOOGLE;
                googleProvider.providerUserId = sub;
                googleProvider.passwordHash = null;
                googleProvider.createdAt = now;
                googleProvider.persist();
            }
        }

        user.lastLogin = OffsetDateTime.now();
        user.updatedAt = OffsetDateTime.now();

        String token = Jwt
                .upn(user.email)
                .claim("uid", user.id)
                .issuer("https://videa")
                .sign();

        return AuthResponse.of(token, user);
    }

    private static String generateUsername(String email) {
        if (email == null)
            return "user";

        int at = email.indexOf('@');
        String local = (at >= 0 ? email.substring(0, at) : email).trim();
        if (local.isEmpty())
            return "user";

        local = Normalizer.normalize(local, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");

        return local.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._]+", ".")
                .replaceAll("\\.+", ".")
                .replaceAll("^[._]+|[._]+$", "");
    }
}
