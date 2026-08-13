package com.devluanpaiva.controle_de_remedios.modules.dashboard.dto;

public record PatientsSummaryResponseDTO(
        long totalCount,
        long newThisMonthCount,
        long withoutAccountCount,
        long pendingRegistrationRequestsCount) {
}
