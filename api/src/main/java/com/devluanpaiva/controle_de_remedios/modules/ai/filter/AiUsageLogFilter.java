package com.devluanpaiva.controle_de_remedios.modules.ai.filter;

import java.time.LocalDate;
import java.util.UUID;

public record AiUsageLogFilter(
        String model,
        UUID userId,
        LocalDate startDate,
        LocalDate endDate) {
}
