package com.devluanpaiva.controle_de_remedios.modules.auth.service;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.auth.client.GoogleOAuthClient;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.GoogleDesktopLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.GoogleLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.GoogleIdentity;
import com.devluanpaiva.controle_de_remedios.security.GoogleIdentityVerifier;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    private static final String EMAIL_FIELD = "email";

    private final GoogleIdentityVerifier googleIdentityVerifier;
    private final GoogleOAuthClient googleOAuthClient;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponseDTO loginWithIdToken(GoogleLoginRequestDTO dto) {
        GoogleIdentity identity = googleIdentityVerifier.verify(dto.idToken());
        User user = resolveVerifiedUser(identity);
        return issueTokensFor(user);
    }

    public AuthResponseDTO loginWithAuthorizationCode(GoogleDesktopLoginRequestDTO dto) {
        String idToken = googleOAuthClient.exchangeAuthorizationCodeForIdToken(
                dto.code(),
                dto.codeVerifier(),
                dto.redirectUri());

        GoogleIdentity identity = googleIdentityVerifier.verify(idToken);
        User user = resolveVerifiedUser(identity);

        if (user.getRole() == UserRole.PATIENT) {
            throw patientDesktopForbidden();
        }

        return issueTokensFor(user);
    }

    private User resolveVerifiedUser(GoogleIdentity identity) {
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

    private BusinessException patientDesktopForbidden() {
        return new BusinessException(
                HttpStatus.FORBIDDEN,
                "Acesso não autorizado",
                "AUTH_PATIENT_DESKTOP_FORBIDDEN",
                "context",
                "Pacientes não têm acesso ao aplicativo desktop. Utilize o aplicativo mobile.");
    }

    private BusinessException emailNotVerified() {
        return new BusinessException(
                HttpStatus.FORBIDDEN,
                "E-mail do Google não verificado",
                "AUTH_GOOGLE_EMAIL_NOT_VERIFIED",
                EMAIL_FIELD,
                "Sua conta Google precisa ter o e-mail verificado para entrar.");
    }

    private BusinessException emailNotRegistered() {
        return new BusinessException(
                HttpStatus.FORBIDDEN,
                "Acesso não autorizado",
                "AUTH_EMAIL_NOT_REGISTERED",
                EMAIL_FIELD,
                "Não existe uma conta cadastrada com este e-mail. Peça a um administrador para cadastrá-lo antes de entrar com o Google.");
    }
}
