package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;

public record PendingDeliveryItemFilter(
        UUID companyId,
        String patientName,
        String patientCpf,
        PrescriptionStatus status) {
}
