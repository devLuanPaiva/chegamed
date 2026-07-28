package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageContentType;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageOperationType;

public record AiUsageLogResponseDTO(
        UUID id,
        UUID userId,
        String userName,
        String model,
        AiUsageOperationType operationType,
        AiUsageContentType contentType,
        int promptTokens,
        int candidatesTokens,
        int totalTokens,
        BigDecimal estimatedCostUsd,
        LocalDateTime createdAt) {
}
