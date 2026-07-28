package com.devluanpaiva.controle_de_remedios.modules.ai.filter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.ai.entity.AiUsageLog;

public final class AiUsageLogSpecification {
    private AiUsageLogSpecification() {
    }

    public static Specification<AiUsageLog> hasModel(String model) {
        if (!StringUtils.hasText(model)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.get("model"), model);
    }

    public static Specification<AiUsageLog> hasUser(UUID userId) {
        if (userId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(root.join("user").get("id"), userId);
    }

    public static Specification<AiUsageLog> createdFrom(LocalDate startDate) {
        if (startDate == null) {
            return Specification.unrestricted();
        }

        LocalDateTime from = startDate.atStartOfDay();
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get("createdAt"), from);
    }

    public static Specification<AiUsageLog> createdUntil(LocalDate endDate) {
        if (endDate == null) {
            return Specification.unrestricted();
        }

        LocalDateTime until = LocalDateTime.of(endDate, LocalTime.MAX);
        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get("createdAt"), until);
    }
}
