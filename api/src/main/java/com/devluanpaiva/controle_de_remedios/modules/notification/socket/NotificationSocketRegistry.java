package com.devluanpaiva.controle_de_remedios.modules.notification.socket;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class NotificationSocketRegistry {
    private final Map<UUID, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();

    public void register(UUID userId, WebSocketSession session) {
        sessionsByUser
                .computeIfAbsent(userId, key -> ConcurrentHashMap.newKeySet())
                .add(session);
    }

    public void unregister(UUID userId, WebSocketSession session) {
        sessionsByUser.computeIfPresent(userId, (key, sessions) -> {
            sessions.remove(session);
            return sessions.isEmpty() ? null : sessions;
        });
    }

    public void send(UUID userId, String payload) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);

        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        TextMessage message = new TextMessage(payload);

        for (WebSocketSession session : sessions) {
            sendQuietly(userId, session, message);
        }
    }

    private void sendQuietly(UUID userId, WebSocketSession session, TextMessage message) {
        if (!session.isOpen()) {
            unregister(userId, session);
            return;
        }

        try {
            synchronized (session) {
                session.sendMessage(message);
            }
        } catch (IOException ex) {
            log.warn("Falha ao enviar notificação em tempo real; sessão será descartada", ex);
            unregister(userId, session);
        }
    }
}
