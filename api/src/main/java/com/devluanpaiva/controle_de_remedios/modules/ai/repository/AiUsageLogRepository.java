package com.devluanpaiva.controle_de_remedios.modules.ai.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageDailyBreakdownDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageModelBreakdownDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageTotalsDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.entity.AiUsageLog;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, UUID>, JpaSpecificationExecutor<AiUsageLog> {

    @Query("SELECT DISTINCT a.model FROM AiUsageLog a ORDER BY a.model")
    List<String> findDistinctModels();

    @Query("""
            SELECT new com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageTotalsDTO(
                COUNT(a),
                COALESCE(SUM(a.promptTokens), 0),
                COALESCE(SUM(a.candidatesTokens), 0),
                COALESCE(SUM(a.totalTokens), 0),
                COALESCE(SUM(a.estimatedCostUsd), 0))
            FROM AiUsageLog a
            WHERE (:model IS NULL OR a.model = :model)
              AND (:userId IS NULL OR a.user.id = :userId)
              AND (:from IS NULL OR a.createdAt >= :from)
              AND (:until IS NULL OR a.createdAt <= :until)
            """)
    AiUsageTotalsDTO findTotals(
            @Param("model") String model,
            @Param("userId") UUID userId,
            @Param("from") LocalDateTime from,
            @Param("until") LocalDateTime until);

    @Query("""
            SELECT new com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageModelBreakdownDTO(
                a.model, COUNT(a), COALESCE(SUM(a.totalTokens), 0), COALESCE(SUM(a.estimatedCostUsd), 0))
            FROM AiUsageLog a
            WHERE (:model IS NULL OR a.model = :model)
              AND (:userId IS NULL OR a.user.id = :userId)
              AND (:from IS NULL OR a.createdAt >= :from)
              AND (:until IS NULL OR a.createdAt <= :until)
            GROUP BY a.model
            ORDER BY a.model
            """)
    List<AiUsageModelBreakdownDTO> findModelBreakdown(
            @Param("model") String model,
            @Param("userId") UUID userId,
            @Param("from") LocalDateTime from,
            @Param("until") LocalDateTime until);

    @Query("""
            SELECT new com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageDailyBreakdownDTO(
                CAST(a.createdAt AS LocalDate), COUNT(a), COALESCE(SUM(a.totalTokens), 0), COALESCE(SUM(a.estimatedCostUsd), 0))
            FROM AiUsageLog a
            WHERE (:model IS NULL OR a.model = :model)
              AND (:userId IS NULL OR a.user.id = :userId)
              AND (:from IS NULL OR a.createdAt >= :from)
              AND (:until IS NULL OR a.createdAt <= :until)
            GROUP BY CAST(a.createdAt AS LocalDate)
            ORDER BY CAST(a.createdAt AS LocalDate)
            """)
    List<AiUsageDailyBreakdownDTO> findDailyBreakdown(
            @Param("model") String model,
            @Param("userId") UUID userId,
            @Param("from") LocalDateTime from,
            @Param("until") LocalDateTime until);
}
