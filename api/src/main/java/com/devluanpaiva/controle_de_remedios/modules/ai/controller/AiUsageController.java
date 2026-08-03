package com.devluanpaiva.controle_de_remedios.modules.ai.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageLogResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.filter.AiUsageLogFilter;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.AiUsageQueryService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ai/usage")
@RequiredArgsConstructor
public class AiUsageController {
    private final AiUsageQueryService aiUsageQueryService;

    @GetMapping("/logs")
    public ApiResponse<List<AiUsageLogResponseDTO>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        AiUsageLogFilter filter = new AiUsageLogFilter(model, userId, startDate, endDate);
        Page<AiUsageLogResponseDTO> result = aiUsageQueryService.search(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Uso da IA obtido com sucesso", result, next, previous);
    }

    @GetMapping("/summary")
    public ApiResponse<AiUsageSummaryResponseDTO> getSummary(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        AiUsageLogFilter filter = new AiUsageLogFilter(model, userId, startDate, endDate);

        return ApiResponseFactory.success(
                "Resumo de uso da IA obtido com sucesso", aiUsageQueryService.getSummary(filter));
    }

    @GetMapping("/models")
    public ApiResponse<List<String>> getModels() {
        return ApiResponseFactory.list("Modelos utilizados obtidos com sucesso", aiUsageQueryService.getDistinctModels());
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }
}
