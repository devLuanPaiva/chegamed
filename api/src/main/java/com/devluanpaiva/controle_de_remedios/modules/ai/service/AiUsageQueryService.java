package com.devluanpaiva.controle_de_remedios.modules.ai.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageLogResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.filter.AiUsageLogFilter;

public interface AiUsageQueryService {
    Page<AiUsageLogResponseDTO> search(AiUsageLogFilter filter, Pageable pageable);

    AiUsageSummaryResponseDTO getSummary(AiUsageLogFilter filter);

    List<String> getDistinctModels();
}
