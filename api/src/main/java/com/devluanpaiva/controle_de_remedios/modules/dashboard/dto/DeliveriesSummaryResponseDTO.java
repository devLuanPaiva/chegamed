package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

public record DeliveriesSummaryResponseDTO(
        long totalCount,
        long thisMonthCount,
        long overdueCount,
        long upcomingCount) {
}
