package com.ft.transcendence.auth.app;

import java.time.OffsetDateTime;

import com.ft.transcendence.auth.dto.ChangePasswordRequest;
import com.ft.transcendence.common.exception.UnprocessableEntityException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;

import com.ft.transcendence.auth.dto.AuthResponse;
import com.ft.transcendence.auth.dto.RegisterRequest;
import com.ft.transcendence.auth.domain.AuthProvider;
import com.ft.transcendence.user.domain.User;

import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;

import static com.ft.transcendence.auth.domain.AuthProvider.createAuthProviderLocal;
import static com.ft.transcendence.preferences.domain.UserPreference.createDefaultPreferences;

@ApplicationScoped
public class AuthService {

    @Transactional
    public AuthResponse registerLocal(RegisterRequest req) {
        validateRegister(req);

        ensureEmailAndUsernameAreFree(req);

        var now = OffsetDateTime.now();

        var user = new User();
        user.email = req.email.trim().toLowerCase();
        user.username = req.username.trim();
        user.name = req.name;
        user.active = true;
        user.createdAt = now;
        user.updatedAt = now;
        user.persist();

        createAuthProviderLocal(user, req, now);

        createDefaultPreferences(user, now);

        String token = issueToken(user);
        return AuthResponse.of(token, user);
    }

    private void ensureEmailAndUsernameAreFree(RegisterRequest req) {
        if (User.find("email", req.email.trim().toLowerCase()).firstResult() != null)
            throw new BadRequestException("Email already in use");
        if (User.find("username", req.username.trim()).firstResult() != null)
            throw new BadRequestException("Username already in use");
    }

    @Transactional
    public AuthResponse login(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank())
            throw new NotAuthorizedException("Username or Password is blank");

        User user = User.findByEmailOrUsername(username.trim());
        if (user == null || !user.active)
            throw new NotAuthorizedException("User not found");

        AuthProvider local = AuthProvider.findLocalByUserId(user.id);
        if (local == null || local.passwordHash == null)
            throw new NotAuthorizedException("User not found");

        if (!BcryptUtil.matches(password, local.passwordHash))
            throw new NotAuthorizedException("Incorrect password");

        var now = OffsetDateTime.now();
        user.lastLogin = now;
        user.updatedAt = now;

        String token = issueToken(user);
        return AuthResponse.of(token, user);
    }

    private String issueToken(User user) {
        return Jwt
                .upn(user.email)
                .claim("uid", user.id)
                .claim("name", user.name)
                .claim("username", user.username)
                .sign();
    }

    private void validateRegister(RegisterRequest req) {
        if (req == null)
            throw new BadRequestException("Invalid payload");
        if (req.email == null || req.email.isBlank())
            throw new BadRequestException("Email is required");
        if (req.username == null || req.username.isBlank())
            throw new BadRequestException("Username is required");
        if (req.password == null || req.password.isBlank())
            throw new BadRequestException("Password is required");
    }

    @Transactional
    public void changePassword(Long currentUserId, ChangePasswordRequest req) {
        AuthProvider local = AuthProvider.findLocalByUserId(currentUserId);
        if (local == null)
            throw new BadRequestException("Password change not available for this account type");

        if (!BcryptUtil.matches(req.currentPassword, local.passwordHash))
            throw new UnprocessableEntityException("Current password is incorrect");

        if (req.newPassword == null || req.newPassword.isBlank() || req.newPassword.length() < 8)
            throw new BadRequestException("New password must be at least 8 characters");

        local.passwordHash = BcryptUtil.bcryptHash(req.newPassword);
    }
}
