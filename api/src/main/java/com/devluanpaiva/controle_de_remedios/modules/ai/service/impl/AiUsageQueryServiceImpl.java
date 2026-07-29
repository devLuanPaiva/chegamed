package com.devluanpaiva.controle_de_remedios.modules.ai.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageLogResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageTotalsDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.entity.AiUsageLog;
import com.devluanpaiva.controle_de_remedios.modules.ai.filter.AiUsageLogFilter;
import com.devluanpaiva.controle_de_remedios.modules.ai.filter.AiUsageLogSpecification;
import com.devluanpaiva.controle_de_remedios.modules.ai.repository.AiUsageLogRepository;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiUsageQueryService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiUsageQueryServiceImpl implements AiUsageQueryService {
    private static final LocalDateTime EARLIEST_POSSIBLE_DATE = LocalDateTime.of(1970, 1, 1, 0, 0);
    private static final LocalDateTime LATEST_POSSIBLE_DATE = LocalDateTime.of(9999, 12, 31, 23, 59, 59);

    private final AiUsageLogRepository aiUsageLogRepository;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional(readOnly = true)
    public Page<AiUsageLogResponseDTO> search(AiUsageLogFilter filter, Pageable pageable) {
        assertIsAdmin();

        Specification<AiUsageLog> specification = AiUsageLogSpecification.hasModel(filter.model())
                .and(AiUsageLogSpecification.hasUser(filter.userId()))
                .and(AiUsageLogSpecification.createdFrom(filter.startDate()))
                .and(AiUsageLogSpecification.createdUntil(filter.endDate()));

        return aiUsageLogRepository.findAll(specification, pageable).map(this::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public AiUsageSummaryResponseDTO getSummary(AiUsageLogFilter filter) {
        assertIsAdmin();

        LocalDateTime from = filter.startDate() != null ? filter.startDate().atStartOfDay() : EARLIEST_POSSIBLE_DATE;
        LocalDateTime until = filter.endDate() != null ? LocalDateTime.of(filter.endDate(), LocalTime.MAX) : LATEST_POSSIBLE_DATE;

        AiUsageTotalsDTO totals = aiUsageLogRepository.findTotals(filter.model(), filter.userId(), from, until);

        return new AiUsageSummaryResponseDTO(
                totals.totalRequests(),
                totals.totalPromptTokens(),
                totals.totalCandidatesTokens(),
                totals.totalTokens(),
                totals.totalCostUsd(),
                averageCostPerRequest(totals),
                aiUsageLogRepository.findModelBreakdown(filter.model(), filter.userId(), from, until),
                aiUsageLogRepository.findDailyBreakdown(filter.model(), filter.userId(), from, until));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctModels() {
        assertIsAdmin();

        return aiUsageLogRepository.findDistinctModels();
    }

    private BigDecimal averageCostPerRequest(AiUsageTotalsDTO totals) {
        if (totals.totalRequests() == 0) {
            return BigDecimal.ZERO.setScale(6, RoundingMode.HALF_UP);
        }

        return totals.totalCostUsd().divide(BigDecimal.valueOf(totals.totalRequests()), 6, RoundingMode.HALF_UP);
    }

    private AiUsageLogResponseDTO toResponseDTO(AiUsageLog log) {
        User user = log.getUser();

        return new AiUsageLogResponseDTO(
                log.getId(),
                user.getId(),
                user.getName(),
                log.getModel(),
                log.getOperationType(),
                log.getContentType(),
                log.getPromptTokens(),
                log.getCandidatesTokens(),
                log.getTotalTokens(),
                log.getEstimatedCostUsd(),
                log.getCreatedAt());
    }

    private void assertIsAdmin() {
        authorizationPolicy.requireAdmin(securityContextHelper.getCurrentUser());
    }
}
