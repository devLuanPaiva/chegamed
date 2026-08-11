package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

public record MedicinesSummaryResponseDTO(
        long totalCount,
        long newThisMonthCount,
        long withoutEanCodeCount,
        long movementsThisMonthCount) {
}
