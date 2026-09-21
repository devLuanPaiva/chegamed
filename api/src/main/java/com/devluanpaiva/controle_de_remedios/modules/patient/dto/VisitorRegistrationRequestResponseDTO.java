package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.patient.enums.PatientRegistrationRequestStatus;

public record VisitorRegistrationRequestResponseDTO(
        UUID id,
        UUID companyId,
        String companyName,
        String name,
        String maskedCpf,
        PatientRegistrationRequestStatus status,
        LocalDateTime createdAt) {
}
