package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AiUsageDailyBreakdownDTO(
        LocalDate date,
        long requests,
        long totalTokens,
        BigDecimal costUsd) {
}
