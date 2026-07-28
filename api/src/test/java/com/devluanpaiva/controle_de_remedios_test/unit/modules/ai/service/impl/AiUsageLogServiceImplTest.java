package com.devluanpaiva.controle_de_remedios_test.unit.modules.ai.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.devluanpaiva.controle_de_remedios.modules.ai.client.GeminiClient.GeminiUsage;
import com.devluanpaiva.controle_de_remedios.modules.ai.config.GeminiPricingProperties;
import com.devluanpaiva.controle_de_remedios.modules.ai.config.GeminiPricingProperties.ModelPricing;
import com.devluanpaiva.controle_de_remedios.modules.ai.entity.AiUsageLog;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageContentType;
import com.devluanpaiva.controle_de_remedios.modules.ai.enums.AiUsageOperationType;
import com.devluanpaiva.controle_de_remedios.modules.ai.repository.AiUsageLogRepository;
import com.devluanpaiva.controle_de_remedios.modules.ai.service.impl.AiUsageLogServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiUsageLogServiceImpl")
class AiUsageLogServiceImplTest {

    private static final String MODEL = "gemini-2.5-flash";

    @Mock
    private AiUsageLogRepository aiUsageLogRepository;

    @Mock
    private GeminiPricingProperties geminiPricingProperties;

    private AiUsageLogServiceImpl aiUsageLogService;

    @BeforeEach
    void setUp() {
        aiUsageLogService = new AiUsageLogServiceImpl(aiUsageLogRepository, geminiPricingProperties);
    }

    private User buildUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Admin")
                .email("admin@example.com")
                .password("encoded-password")
                .cpf("11144477735")
                .role(UserRole.ADMIN)
                .build();
    }

    @Nested
    @DisplayName("record")
    class Record {

        @Test
        @DisplayName("should persist a usage log with cost calculated from the configured pricing")
        void shouldPersistUsageLogWithCalculatedCost() {
            when(geminiPricingProperties.pricingFor(MODEL)).thenReturn(
                    new ModelPricing(BigDecimal.valueOf(0.10), BigDecimal.valueOf(0.40)));

            User actor = buildUser();
            GeminiUsage usage = new GeminiUsage(1_000_000, 500_000, 1_500_000);

            aiUsageLogService.record(
                    actor, MODEL, AiUsageOperationType.BARCODE_EXTRACTION, AiUsageContentType.IMAGE, usage);

            ArgumentCaptor<AiUsageLog> captor = ArgumentCaptor.forClass(AiUsageLog.class);
            verify(aiUsageLogRepository).save(captor.capture());

            AiUsageLog savedLog = captor.getValue();
            assertThat(savedLog.getUser()).isEqualTo(actor);
            assertThat(savedLog.getModel()).isEqualTo(MODEL);
            assertThat(savedLog.getOperationType()).isEqualTo(AiUsageOperationType.BARCODE_EXTRACTION);
            assertThat(savedLog.getContentType()).isEqualTo(AiUsageContentType.IMAGE);
            assertThat(savedLog.getPromptTokens()).isEqualTo(1_000_000);
            assertThat(savedLog.getCandidatesTokens()).isEqualTo(500_000);
            assertThat(savedLog.getTotalTokens()).isEqualTo(1_500_000);
            // 1_000_000 tokens * $0.10/1M + 500_000 tokens * $0.40/1M = 0.10 + 0.20 = 0.30
            assertThat(savedLog.getEstimatedCostUsd()).isEqualByComparingTo("0.30");
        }

        @Test
        @DisplayName("should estimate cost as zero when no pricing is configured for the model")
        void shouldEstimateCostAsZeroWhenPricingIsMissing() {
            when(geminiPricingProperties.pricingFor(MODEL)).thenReturn(null);

            aiUsageLogService.record(
                    buildUser(), MODEL, AiUsageOperationType.BARCODE_EXTRACTION, AiUsageContentType.IMAGE,
                    new GeminiUsage(100, 50, 150));

            ArgumentCaptor<AiUsageLog> captor = ArgumentCaptor.forClass(AiUsageLog.class);
            verify(aiUsageLogRepository).save(captor.capture());

            assertThat(captor.getValue().getEstimatedCostUsd()).isEqualByComparingTo("0");
        }

        @Test
        @DisplayName("should not persist anything when total tokens is zero")
        void shouldNotPersistWhenTotalTokensIsZero() {
            aiUsageLogService.record(
                    buildUser(), MODEL, AiUsageOperationType.BARCODE_EXTRACTION, AiUsageContentType.IMAGE,
                    GeminiUsage.EMPTY);

            verify(aiUsageLogRepository, never()).save(any());
        }
    }
}
