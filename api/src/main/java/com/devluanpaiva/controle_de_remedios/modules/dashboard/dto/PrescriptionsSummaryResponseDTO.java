package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

public record PrescriptionsSummaryResponseDTO(
        long totalCount,
        long pendingCount,
        long canceledCount,
        long issuedThisMonthCount) {
}
