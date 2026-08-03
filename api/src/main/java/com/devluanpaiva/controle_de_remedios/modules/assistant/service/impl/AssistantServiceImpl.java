package com.devluanpaiva.controle_de_remedios.modules.assistant.service.impl;

import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageContentType;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageOperationType;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiUsageLogService;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiUsageLogService.ExternalAiUsage;
import com.devluanpaiva.controle_de_remedios.modules.assistant.client.N8nAssistantClient;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.ChatResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.dto.RecordAssistantUsageRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.assistant.service.AssistantService;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssistantServiceImpl implements AssistantService {
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final N8nAssistantClient n8nAssistantClient;
    private final AiUsageLogService aiUsageLogService;

    @Override
    public ChatResponseDTO chat(ChatRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();

        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> isMemberOf(dto.companyId(), actor));

        UUID conversationId = dto.conversationId() != null ? dto.conversationId() : UUID.randomUUID();
        String answer = n8nAssistantClient.ask(dto.message(), dto.companyId(), conversationId, actor.getId());

        return new ChatResponseDTO(conversationId, answer);
    }

    @Override
    public void recordUsage(RecordAssistantUsageRequestDTO dto) {
        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado",
                        "USER_NOT_FOUND",
                        "userId",
                        "Não foi possível encontrar um usuário com o ID '" + dto.userId() + "'."));

        aiUsageLogService.recordExternalUsage(
                user,
                dto.model(),
                AiUsageOperationType.ASSISTANT_CONVERSATION,
                AiUsageContentType.CHAT_MESSAGE,
                new ExternalAiUsage(dto.inputTokens(), dto.outputTokens(), dto.totalTokens(), dto.estimatedCostUsd()));
    }

    private boolean isMemberOf(UUID companyId, User user) {
        return companyRepository.existsByIdAndUsers_Id(companyId, user.getId());
    }
}
