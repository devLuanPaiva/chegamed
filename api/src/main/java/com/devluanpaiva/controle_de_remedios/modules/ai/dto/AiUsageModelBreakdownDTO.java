package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.math.BigDecimal;

public record AiUsageModelBreakdownDTO(
        String model,
        long requests,
        long totalTokens,
        BigDecimal costUsd) {
}
