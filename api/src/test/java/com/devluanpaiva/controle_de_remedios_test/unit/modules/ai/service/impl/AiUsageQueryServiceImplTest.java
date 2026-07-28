package com.devluanpaiva.controle_de_remedios_test.unit.modules.ai.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageDailyBreakdownDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageLogResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageModelBreakdownDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.dto.AiUsageTotalsDTO;
import com.devluanpaiva.controle_de_remedios.modules.ai.entity.AiUsageLog;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageContentType;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageOperationType;
import com.devluanpaiva.controle_de_remedios.modules.ai.filter.AiUsageLogFilter;
import com.devluanpaiva.controle_de_remedios.modules.ai.repository.AiUsageLogRepository;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.impl.AiUsageQueryServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiUsageQueryServiceImpl")
class AiUsageQueryServiceImplTest {

    private static final AiUsageLogFilter NO_FILTER = new AiUsageLogFilter(null, null, null, null);

    @Mock
    private AiUsageLogRepository aiUsageLogRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private AiUsageQueryServiceImpl aiUsageQueryService;

    @BeforeEach
    void setUp() {
        aiUsageQueryService = new AiUsageQueryServiceImpl(
                aiUsageLogRepository, securityContextHelper, new AuthorizationPolicy());
    }

    private User buildUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("User " + role.name())
                .email(role.name().toLowerCase() + "@example.com")
                .password("encoded-password")
                .cpf("11144477735")
                .role(role)
                .build();
    }

    private AiUsageLog buildLog(User user) {
        return AiUsageLog.builder()
                .id(UUID.randomUUID())
                .user(user)
                .model("gemini-2.5-flash")
                .operationType(AiUsageOperationType.BARCODE_EXTRACTION)
                .contentType(AiUsageContentType.IMAGE)
                .promptTokens(100)
                .candidatesTokens(50)
                .totalTokens(150)
                .estimatedCostUsd(new BigDecimal("0.001500"))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void assertForbidden(ThrowingCallable callable) {
        assertThatThrownBy(callable)
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException businessException = (BusinessException) ex;
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                });
    }

    @Nested
    @DisplayName("search")
    class Search {

        @Test
        @DisplayName("should map each persisted log to a response DTO")
        void shouldMapLogsToResponseDto() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.ADMIN));

            User loggedUser = buildUser(UserRole.ASSISTANT);
            AiUsageLog log = buildLog(loggedUser);
            Pageable pageable = PageRequest.of(0, 20);

            when(aiUsageLogRepository.findAll(anySpecification(), eq(pageable)))
                    .thenReturn(new PageImpl<>(List.of(log), pageable, 1));

            Page<AiUsageLogResponseDTO> result = aiUsageQueryService.search(NO_FILTER, pageable);

            assertThat(result.getContent()).hasSize(1);
            AiUsageLogResponseDTO dto = result.getContent().get(0);
            assertThat(dto.id()).isEqualTo(log.getId());
            assertThat(dto.userId()).isEqualTo(loggedUser.getId());
            assertThat(dto.userName()).isEqualTo(loggedUser.getName());
            assertThat(dto.model()).isEqualTo("gemini-2.5-flash");
            assertThat(dto.operationType()).isEqualTo(AiUsageOperationType.BARCODE_EXTRACTION);
            assertThat(dto.contentType()).isEqualTo(AiUsageContentType.IMAGE);
            assertThat(dto.totalTokens()).isEqualTo(150);
        }

        @Test
        @DisplayName("should deny a non-ADMIN user without querying the repository")
        void shouldDenyNonAdminUser() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.MANAGER));

            assertForbidden(() -> aiUsageQueryService.search(NO_FILTER, PageRequest.of(0, 20)));

            verifyNoInteractions(aiUsageLogRepository);
        }
    }

    @Nested
    @DisplayName("getSummary")
    class GetSummary {

        @Test
        @DisplayName("should combine totals with the model and daily breakdowns")
        void shouldCombineTotalsWithBreakdowns() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.ADMIN));

            AiUsageTotalsDTO totals = new AiUsageTotalsDTO(4, 400, 200, 600, new BigDecimal("1.200000"));
            List<AiUsageModelBreakdownDTO> byModel = List.of(
                    new AiUsageModelBreakdownDTO("gemini-2.5-flash", 4, 600, new BigDecimal("1.200000")));
            List<AiUsageDailyBreakdownDTO> byDay = List.of(
                    new AiUsageDailyBreakdownDTO(LocalDate.now(), 4, 600, new BigDecimal("1.200000")));

            when(aiUsageLogRepository.findTotals(isNull(), isNull(), isNull(), isNull())).thenReturn(totals);
            when(aiUsageLogRepository.findModelBreakdown(isNull(), isNull(), isNull(), isNull())).thenReturn(byModel);
            when(aiUsageLogRepository.findDailyBreakdown(isNull(), isNull(), isNull(), isNull())).thenReturn(byDay);

            AiUsageSummaryResponseDTO summary = aiUsageQueryService.getSummary(NO_FILTER);

            assertThat(summary.totalRequests()).isEqualTo(4);
            assertThat(summary.totalCostUsd()).isEqualByComparingTo("1.200000");
            assertThat(summary.avgCostPerRequestUsd()).isEqualByComparingTo("0.300000");
            assertThat(summary.byModel()).isEqualTo(byModel);
            assertThat(summary.byDay()).isEqualTo(byDay);
        }

        @Test
        @DisplayName("should return zero average cost when there are no requests in the period")
        void shouldReturnZeroAverageWhenThereAreNoRequests() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.ADMIN));

            AiUsageTotalsDTO totals = new AiUsageTotalsDTO(0, 0, 0, 0, BigDecimal.ZERO);
            when(aiUsageLogRepository.findTotals(isNull(), isNull(), isNull(), isNull())).thenReturn(totals);
            when(aiUsageLogRepository.findModelBreakdown(isNull(), isNull(), isNull(), isNull()))
                    .thenReturn(List.of());
            when(aiUsageLogRepository.findDailyBreakdown(isNull(), isNull(), isNull(), isNull()))
                    .thenReturn(List.of());

            AiUsageSummaryResponseDTO summary = aiUsageQueryService.getSummary(NO_FILTER);

            assertThat(summary.avgCostPerRequestUsd()).isEqualByComparingTo("0");
        }

        @Test
        @DisplayName("should deny a non-ADMIN user without querying the repository")
        void shouldDenyNonAdminUser() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.ASSISTANT));

            assertForbidden(() -> aiUsageQueryService.getSummary(NO_FILTER));

            verifyNoInteractions(aiUsageLogRepository);
        }
    }

    @Nested
    @DisplayName("getDistinctModels")
    class GetDistinctModels {

        @Test
        @DisplayName("should return the models reported by the repository")
        void shouldReturnDistinctModels() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.ADMIN));
            when(aiUsageLogRepository.findDistinctModels())
                    .thenReturn(List.of("gemini-2.5-flash", "gemini-3.1-flash-lite"));

            List<String> models = aiUsageQueryService.getDistinctModels();

            assertThat(models).containsExactly("gemini-2.5-flash", "gemini-3.1-flash-lite");
        }

        @Test
        @DisplayName("should deny a non-ADMIN user without querying the repository")
        void shouldDenyNonAdminUser() {
            when(securityContextHelper.getCurrentUser()).thenReturn(buildUser(UserRole.PATIENT));

            assertForbidden(() -> aiUsageQueryService.getDistinctModels());

            verifyNoInteractions(aiUsageLogRepository);
        }
    }

    @SuppressWarnings("unchecked")
    private static Specification<AiUsageLog> anySpecification() {
        return any(Specification.class);
    }
}
