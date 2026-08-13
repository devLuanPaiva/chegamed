package com.devluanpaiva.controle_de_remedios.modules.notification.socket;

import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationSocketHandler extends TextWebSocketHandler {
    public static final String USER_ID_ATTRIBUTE = "userId";

    private static final String PING_MESSAGE = "ping";
    private static final String PONG_MESSAGE = "pong";

    private final NotificationSocketRegistry registry;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        UUID userId = resolveUserId(session);

        if (userId == null) {
            return;
        }

        registry.register(userId, session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID userId = resolveUserId(session);

        if (userId == null) {
            return;
        }

        registry.unregister(userId, session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        if (PING_MESSAGE.equalsIgnoreCase(message.getPayload().trim())) {
            session.sendMessage(new TextMessage(PONG_MESSAGE));
        }
    }

    private UUID resolveUserId(WebSocketSession session) {
        Object userId = session.getAttributes().get(USER_ID_ATTRIBUTE);
        return userId instanceof UUID id ? id : null;
    }
}
