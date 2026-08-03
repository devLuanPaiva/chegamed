package com.devluanpaiva.controle_de_remedios.modules.assistant.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record RecordAssistantUsageRequestDTO(
        @NotNull UUID userId,
        @NotBlank @Size(max = 60) String model,
        @NotNull @PositiveOrZero Integer inputTokens,
        @NotNull @PositiveOrZero Integer outputTokens,
        @NotNull @PositiveOrZero Integer totalTokens,
        @NotNull @PositiveOrZero BigDecimal estimatedCostUsd) {
}
