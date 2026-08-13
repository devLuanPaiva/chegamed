package com.devluanpaiva.controle_de_remedios.modules.notification.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.Notification;

@Component
public class NotificationMapper {
    public NotificationResponseDTO toResponseDTO(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getBody(),
                notification.getPrescriptionItem() != null ? notification.getPrescriptionItem().getId() : null,
                notification.getDelivery() != null ? notification.getDelivery().getId() : null,
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt());
    }
}
