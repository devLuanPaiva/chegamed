package com.devluanpaiva.controle_de_remedios.modules.notification.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.devluanpaiva.controle_de_remedios.modules.notification.socket.NotificationSocketHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class NotificationWebSocketConfig implements WebSocketConfigurer {
    public static final String NOTIFICATIONS_ENDPOINT = "/ws/notifications";

    private final NotificationSocketHandler notificationSocketHandler;
    private final NotificationHandshakeInterceptor notificationHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(notificationSocketHandler, NOTIFICATIONS_ENDPOINT)
                .addInterceptors(notificationHandshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
