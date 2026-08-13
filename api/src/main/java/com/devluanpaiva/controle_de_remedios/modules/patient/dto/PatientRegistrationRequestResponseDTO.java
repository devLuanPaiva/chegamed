package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.patient.enums.PatientRegistrationRequestStatus;

public record PatientRegistrationRequestResponseDTO(
        UUID id,
        UUID companyId,
        String name,
        String maskedCpf,
        String contact,
        String address,
        String email,
        PatientRegistrationRequestStatus status,
        LocalDateTime createdAt) {
}
