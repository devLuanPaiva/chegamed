package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.math.BigDecimal;
import java.util.List;

public record AiUsageSummaryResponseDTO(
        long totalRequests,
        long totalPromptTokens,
        long totalCandidatesTokens,
        long totalTokens,
        BigDecimal totalCostUsd,
        BigDecimal avgCostPerRequestUsd,
        List<AiUsageModelBreakdownDTO> byModel,
        List<AiUsageDailyBreakdownDTO> byDay) {
}
