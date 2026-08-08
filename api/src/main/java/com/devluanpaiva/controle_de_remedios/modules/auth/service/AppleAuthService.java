package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AppleLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AppleIdentity;
import com.devluanpaiva.controle_de_remedios.security.AppleIdentityVerifier;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Service
@RequiredArgsConstructor
public class AppleAuthService {
    private static final String EMAIL_FIELD = "email";

    private final AppleIdentityVerifier appleIdentityVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponseDTO loginWithIdToken(AppleLoginRequestDTO dto) {
        AppleIdentity identity = appleIdentityVerifier.verify(dto.identityToken());
        User user = resolveVerifiedUser(identity);
        return issueTokensFor(user);
    }

    private User resolveVerifiedUser(AppleIdentity identity) {
        if (!identity.emailVerified()) {
            throw emailNotVerified();
        }

        return userRepository.findByEmailIgnoreCase(identity.email())
                .orElseThrow(this::emailNotRegistered);
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

    private BusinessException emailNotRegistered() {
        return new BusinessException(
                HttpStatus.FORBIDDEN,
                "Acesso não autorizado",
                "AUTH_EMAIL_NOT_REGISTERED",
                EMAIL_FIELD,
                "Não existe uma conta cadastrada com este e-mail. Peça a um administrador para cadastrá-lo antes de entrar com a Apple.");
    }
}
