package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AppleLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.security.AppleIdentity;
import com.devluanpaiva.controle_de_remedios.security.AppleIdentityVerifier;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Service
@RequiredArgsConstructor
public class AppleAuthService {
    private static final String EMAIL_FIELD = "email";

    private final AppleIdentityVerifier appleIdentityVerifier;
    private final VisitorAccountService visitorAccountService;
    private final JwtService jwtService;

    public AuthResponseDTO loginWithIdToken(AppleLoginRequestDTO dto) {
        AppleIdentity identity = appleIdentityVerifier.verify(dto.identityToken());

        if (!identity.emailVerified()) {
            throw emailNotVerified();
        }

        User user = visitorAccountService.findOrCreateByEmail(identity.email(), dto.fullName(), null);

        return issueTokensFor(user);
    }

    private AuthResponseDTO issueTokensFor(User user) {
        return new AuthResponseDTO(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user));
    }

    private BusinessException emailNotVerified() {
        return new BusinessException(
                HttpStatus.FORBIDDEN,
                "E-mail da Apple não verificado",
                "AUTH_APPLE_EMAIL_NOT_VERIFIED",
                EMAIL_FIELD,
                "Sua conta Apple precisa ter o e-mail verificado para entrar.");
    }
}
