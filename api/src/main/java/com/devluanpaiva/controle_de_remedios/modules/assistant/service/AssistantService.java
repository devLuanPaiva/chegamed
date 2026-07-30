package com.devluanpaiva.controle_de_remedios.modules.assistant.service;

import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.RecordAssistantUsageRequestDTO;

public interface AssistantService {
    ChatResponseDTO chat(ChatRequestDTO dto);

    void recordUsage(RecordAssistantUsageRequestDTO dto);
}
