package com.devluanpaiva.controle_de_remedios.modules.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.notification.enums.NotificationType;

public record NotificationResponseDTO(
        UUID id,
        NotificationType type,
        String title,
        String body,
        UUID prescriptionItemId,
        UUID deliveryId,
        boolean read,
        LocalDateTime readAt,
        LocalDateTime createdAt) {
}
