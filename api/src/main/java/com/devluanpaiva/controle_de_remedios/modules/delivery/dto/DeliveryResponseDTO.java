package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record DeliveryResponseDTO(
        UUID id,
        UUID companyId,
        UUID patientId,
        String patientName,
        String patientAddress,
        UUID prescriptionItemId,
        String medicineName,
        UnityType unityType,
        UUID delivererId,
        String delivererName,
        LocalDate deliveryDate,
        LocalDate nextAvailableDate,
        Integer deliveryQuantity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
