package com.devluanpaiva.controle_de_remedios.modules.notification.config;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.devluanpaiva.controle_de_remedios.modules.notification.socket.NotificationSocketHandler;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationHandshakeInterceptor implements HandshakeInterceptor {
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        String accessToken = extractAccessToken(request);

        if (accessToken == null) {
            return false;
        }

        UUID authenticatedUserId = resolveAuthenticatedUserId(accessToken);

        if (authenticatedUserId == null) {
            return false;
        }

        attributes.put(NotificationSocketHandler.USER_ID_ATTRIBUTE, authenticatedUserId);
        return true;
    }

    private String extractAccessToken(ServerHttpRequest request) {
        String authorizationHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }

        String accessToken = authorizationHeader.substring(BEARER_PREFIX.length()).trim();

        return accessToken.isEmpty() ? null : accessToken;
    }

    private UUID resolveAuthenticatedUserId(String accessToken) {
        try {
            if (!jwtService.isAccessToken(accessToken)) {
                return null;
            }

            UUID userId = jwtService.extractUserId(accessToken);

            return userRepository.existsByIdAndActiveTrue(userId) ? userId : null;
        } catch (Exception ex) {
            log.debug("Handshake de notificações rejeitado por token inválido");
            return null;
        }
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
    }
}
