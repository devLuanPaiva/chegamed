package com.devluanpaiva.controle_de_remedios_test.unit.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AppleLoginRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.dto.AuthResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.auth.service.AppleAuthService;
import com.devluanpaiva.controle_de_remedios.modules.auth.service.VisitorAccountService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AppleIdentity;
import com.devluanpaiva.controle_de_remedios.security.AppleIdentityVerifier;
import com.devluanpaiva.controle_de_remedios.security.JwtService;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppleAuthService")
class AppleAuthServiceTest {

    private static final String EMAIL = "luan@privaterelay.appleid.com";

    @Mock
    private AppleIdentityVerifier appleIdentityVerifier;

    @Mock
    private VisitorAccountService visitorAccountService;

    @Mock
    private JwtService jwtService;

    private AppleAuthService appleAuthService;

    private User user;

    @BeforeEach
    void setUp() {
        appleAuthService = new AppleAuthService(appleIdentityVerifier, visitorAccountService, jwtService);

        user = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email(EMAIL)
                .role(UserRole.PATIENT)
                .active(true)
                .build();
    }

    private final AppleLoginRequestDTO dto = new AppleLoginRequestDTO("apple-identity-token", "Luan Alves");

    @Test
    @DisplayName("should issue tokens for the account resolved from the verified Apple identity")
    void shouldIssueTokensForResolvedAccount() {
        when(appleIdentityVerifier.verify(dto.identityToken())).thenReturn(new AppleIdentity("sub", EMAIL, true));
        when(visitorAccountService.findOrCreateByEmail(EMAIL, "Luan Alves", null)).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");

        AuthResponseDTO response = appleAuthService.loginWithIdToken(dto);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
    }

    @Test
    @DisplayName("should issue tokens for the provisioned visitor when the Apple e-mail is unknown")
    void shouldIssueTokensForProvisionedVisitor() {
        User visitor = User.builder()
                .id(UUID.randomUUID())
                .name("Luan Alves")
                .email(EMAIL)
                .role(UserRole.VISITOR)
                .active(true)
                .build();

        when(appleIdentityVerifier.verify(dto.identityToken())).thenReturn(new AppleIdentity("sub", EMAIL, true));
        when(visitorAccountService.findOrCreateByEmail(EMAIL, "Luan Alves", null)).thenReturn(visitor);
        when(jwtService.generateAccessToken(visitor)).thenReturn("visitor-access-token");
        when(jwtService.generateRefreshToken(visitor)).thenReturn("visitor-refresh-token");

        AuthResponseDTO response = appleAuthService.loginWithIdToken(dto);

        assertThat(response.accessToken()).isEqualTo("visitor-access-token");
    }

    @Test
    @DisplayName("should throw 403 without provisioning anything when the Apple e-mail is not verified")
    void shouldThrowForbiddenWhenEmailIsNotVerified() {
        when(appleIdentityVerifier.verify(dto.identityToken())).thenReturn(new AppleIdentity("sub", EMAIL, false));

        assertThatThrownBy(() -> appleAuthService.loginWithIdToken(dto))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(businessException.getCode()).isEqualTo("AUTH_APPLE_EMAIL_NOT_VERIFIED");
                });

        verify(visitorAccountService, never()).findOrCreateByEmail(anyString(), anyString(), anyString());
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("should propagate the verifier's exception when the identity token is invalid")
    void shouldPropagateVerifierException() {
        BusinessException tokenInvalid = new BusinessException(
                HttpStatus.UNAUTHORIZED, "Token da Apple inválido", "AUTH_APPLE_TOKEN_INVALID", "identityToken",
                "detail");
        when(appleIdentityVerifier.verify(dto.identityToken())).thenThrow(tokenInvalid);

        assertThatThrownBy(() -> appleAuthService.loginWithIdToken(dto)).isSameAs(tokenInvalid);

        verify(visitorAccountService, never()).findOrCreateByEmail(anyString(), anyString(), anyString());
    }
}
