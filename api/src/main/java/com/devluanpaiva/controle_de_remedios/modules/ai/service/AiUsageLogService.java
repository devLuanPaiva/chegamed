package com.devluanpaiva.controle_de_remedios.modules.ai.service;

import java.math.BigDecimal;

import com.devluanpaiva.controle_de_remedios.modules.ai.client.GeminiClient.GeminiUsage;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageContentType;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageOperationType;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;

public interface AiUsageLogService {
    void record(
            User actor,
            String model,
            AiUsageOperationType operationType,
            AiUsageContentType contentType,
            GeminiUsage usage);

    void recordExternalUsage(
            User actor,
            String model,
            AiUsageOperationType operationType,
            AiUsageContentType contentType,
            ExternalAiUsage usage);

    record ExternalAiUsage(int promptTokens, int candidatesTokens, int totalTokens, BigDecimal estimatedCostUsd) {
    }
}
