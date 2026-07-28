package com.devluanpaiva.controle_de_remedios.modules.delivery.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record PendingDeliveryItemResponseDTO(
        UUID prescriptionItemId,
        UUID prescriptionId,
        UUID patientId,
        String patientName,
        LocalDate issueDate,
        String medicineName,
        PrescriptionStatus status,
        UnityType unityType,
        Integer prescribedQuantity) {
}
