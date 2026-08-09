package com.devluanpaiva.controle_de_remedios.modules.patient.dto;

import java.util.UUID;

public record PublicCompanySummaryDTO(
        UUID id,
        String name,
        String imageUrl) {
}
