package com.devluanpaiva.controle_de_remedios.modules.ai.service;

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
}
