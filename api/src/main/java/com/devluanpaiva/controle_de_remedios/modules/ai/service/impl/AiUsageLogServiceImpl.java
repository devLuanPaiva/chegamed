package com.devluanpaiva.controle_de_remedios.modules.ai.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.ai.client.GeminiClient.GeminiUsage;
import com.devluanpaiva.controle_de_remedios.modules.ai.config.GeminiPricingProperties;
import com.devluanpaiva.controle_de_remedios.modules.ai.config.GeminiPricingProperties.ModelPricing;
import com.devluanpaiva.controle_de_remedios.modules.ai.entity.AiUsageLog;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageContentType;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageOperationType;
import com.devluanpaiva.controle_de_remedios.modules.ai.repository.AiUsageLogRepository;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiUsageLogService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiUsageLogServiceImpl implements AiUsageLogService {
    private static final BigDecimal ONE_MILLION = BigDecimal.valueOf(1_000_000);
    private static final int COST_SCALE = 6;

    private final AiUsageLogRepository aiUsageLogRepository;
    private final GeminiPricingProperties geminiPricingProperties;

    @Override
    @Transactional
    public void record(
            User actor,
            String model,
            AiUsageOperationType operationType,
            AiUsageContentType contentType,
            GeminiUsage usage) {

        if (usage.totalTokens() <= 0) {
            return;
        }

        AiUsageLog log = AiUsageLog.builder()
                .user(actor)
                .model(model)
                .operationType(operationType)
                .contentType(contentType)
                .promptTokens(usage.promptTokens())
                .candidatesTokens(usage.candidatesTokens())
                .totalTokens(usage.totalTokens())
                .estimatedCostUsd(estimateCost(model, usage))
                .build();

        aiUsageLogRepository.save(log);
    }

    @Override
    @Transactional
    public void recordExternalUsage(
            User actor,
            String model,
            AiUsageOperationType operationType,
            AiUsageContentType contentType,
            ExternalAiUsage usage) {

        if (usage.totalTokens() <= 0) {
            return;
        }

        AiUsageLog log = AiUsageLog.builder()
                .user(actor)
                .model(model)
                .operationType(operationType)
                .contentType(contentType)
                .promptTokens(usage.promptTokens())
                .candidatesTokens(usage.candidatesTokens())
                .totalTokens(usage.totalTokens())
                .estimatedCostUsd(usage.estimatedCostUsd())
                .build();

        aiUsageLogRepository.save(log);
    }

    private BigDecimal estimateCost(String model, GeminiUsage usage) {
        ModelPricing pricing = geminiPricingProperties.pricingFor(model);

        if (pricing == null) {
            log.warn("Nenhum preço configurado para o modelo Gemini '{}' -> custo estimado como zero", model);
            return BigDecimal.ZERO.setScale(COST_SCALE, RoundingMode.HALF_UP);
        }

        BigDecimal inputCost = BigDecimal.valueOf(usage.promptTokens())
                .divide(ONE_MILLION, COST_SCALE, RoundingMode.HALF_UP)
                .multiply(pricing.inputPerMillionTokens());

        BigDecimal outputCost = BigDecimal.valueOf(usage.candidatesTokens())
                .divide(ONE_MILLION, COST_SCALE, RoundingMode.HALF_UP)
                .multiply(pricing.outputPerMillionTokens());

        return inputCost.add(outputCost).setScale(COST_SCALE, RoundingMode.HALF_UP);
    }
}
