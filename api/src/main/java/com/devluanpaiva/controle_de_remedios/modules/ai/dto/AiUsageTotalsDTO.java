package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.math.BigDecimal;

public record AiUsageTotalsDTO(
        long totalRequests,
        long totalPromptTokens,
        long totalCandidatesTokens,
        long totalTokens,
        BigDecimal totalCostUsd) {
}
