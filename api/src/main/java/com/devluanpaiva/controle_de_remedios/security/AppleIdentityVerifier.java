package com.devluanpaiva.controle_de_remedios.security;

import java.text.ParseException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppleIdentityVerifier {

    private final ConfigurableJWTProcessor<SecurityContext> appleJwtProcessor;

    public AppleIdentity verify(String identityToken) {
        JWTClaimsSet claims = parse(identityToken);

        return new AppleIdentity(
                claims.getSubject(),
                (String) claims.getClaim("email"),
                isEmailVerified(claims));
    }

    private JWTClaimsSet parse(String identityToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(identityToken);
            return appleJwtProcessor.process(signedJWT, null);
        } catch (ParseException | JOSEException | BadJOSEException ex) {
            log.warn("Falha ao verificar o ID token da Apple", ex);
            throw invalidToken();
        }
    }

    private boolean isEmailVerified(JWTClaimsSet claims) {
        Object emailVerified = claims.getClaim("email_verified");
        return Boolean.TRUE.equals(emailVerified) || "true".equals(emailVerified);
    }

    private BusinessException invalidToken() {
        return new BusinessException(
                HttpStatus.UNAUTHORIZED,
                "Token da Apple inválido",
                "AUTH_APPLE_TOKEN_INVALID",
                "identityToken",
                "O token da Apple informado é inválido, expirado ou não foi emitido para este aplicativo.");
    }
}
