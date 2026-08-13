package com.devluanpaiva.controle_de_remedios.modules.notification.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.notification.client.ExpoPushClient;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.DevicePushToken;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.Notification;
import com.devluanpaiva.controle_de_remedios.modules.notification.mapper.NotificationMapper;
import com.devluanpaiva.controle_de_remedios.modules.notification.repository.DevicePushTokenRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.repository.NotificationRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationDispatcher;
import com.devluanpaiva.controle_de_remedios.modules.notification.socket.NotificationSocketRegistry;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDispatcherImpl implements NotificationDispatcher {
    private static final String NOTIFICATION_CREATED_EVENT = "NOTIFICATION_CREATED";

    private final NotificationSocketRegistry socketRegistry;
    private final NotificationRepository notificationRepository;
    private final DevicePushTokenRepository devicePushTokenRepository;
    private final NotificationMapper notificationMapper;
    private final ExpoPushClient expoPushClient;
    private final ObjectMapper objectMapper;

    @Override
    public void dispatch(Notification notification) {
        UUID recipientId = notification.getRecipient().getId();

        publishRealtime(recipientId, notification);
        publishPush(recipientId, notification);
    }

    private void publishRealtime(UUID recipientId, Notification notification) {
        long unreadCount = notificationRepository.countByRecipient_IdAndReadAtIsNull(recipientId);
        NotificationResponseDTO payload = notificationMapper.toResponseDTO(notification);

        try {
            String message = objectMapper.writeValueAsString(
                    new NotificationSocketEvent(NOTIFICATION_CREATED_EVENT, payload, unreadCount));

            socketRegistry.send(recipientId, message);
        } catch (JsonProcessingException ex) {
            log.warn("Falha ao serializar notificação para envio em tempo real", ex);
        }
    }

    private void publishPush(UUID recipientId, Notification notification) {
        List<String> deviceTokens = devicePushTokenRepository.findByUser_Id(recipientId).stream()
                .map(DevicePushToken::getToken)
                .toList();

        if (deviceTokens.isEmpty()) {
            return;
        }

        expoPushClient.send(deviceTokens, notification.getTitle(), notification.getBody(), buildPushData(notification));
    }

    private Map<String, Object> buildPushData(Notification notification) {
        Map<String, Object> data = new HashMap<>();
        data.put("notificationId", notification.getId().toString());
        data.put("type", notification.getType().name());

        if (notification.getPrescriptionItem() != null) {
            data.put("prescriptionItemId", notification.getPrescriptionItem().getId().toString());
        }

        if (notification.getDelivery() != null) {
            data.put("deliveryId", notification.getDelivery().getId().toString());
        }

        return data;
    }

    private record NotificationSocketEvent(
            String event,
            NotificationResponseDTO notification,
            long unreadCount) {
    }
}
