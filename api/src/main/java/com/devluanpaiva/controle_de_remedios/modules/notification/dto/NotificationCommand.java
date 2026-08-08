package com.devluanpaiva.controle_de_remedios.modules.notification.dto;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.notification.enums.NotificationType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;

import lombok.Builder;

@Builder
public record NotificationCommand(
        User recipient,
        NotificationType type,
        String title,
        String body,
        PrescriptionItem prescriptionItem,
        Delivery delivery) {
}
