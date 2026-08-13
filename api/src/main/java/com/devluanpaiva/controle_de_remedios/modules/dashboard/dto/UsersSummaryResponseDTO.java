package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

public record UsersSummaryResponseDTO(
        long totalCount,
        long activeCount,
        long inactiveCount,
        long newThisMonthCount) {
}
