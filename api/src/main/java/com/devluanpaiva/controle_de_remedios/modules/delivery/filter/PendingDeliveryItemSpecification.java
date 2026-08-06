package com.devluanpaiva.controle_de_remedios.modules.delivery.filter;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public final class PendingDeliveryItemSpecification {
    private PendingDeliveryItemSpecification() {
    }

    public static Specification<PrescriptionItem> isDeliverable() {
        return hasStatusIn(PrescriptionStatus.deliverable());
    }

    public static Specification<PrescriptionItem> isAwaitingDispatch() {
        return hasStatusIn(PrescriptionStatus.dispatchable());
    }

    public static Specification<PrescriptionItem> isOutForDelivery() {
        return hasStatusIn(List.of(PrescriptionStatus.OUT_FOR_DELIVERY));
    }

    public static Specification<PrescriptionItem> atDeliveryStage(PrescriptionStatus status) {
        if (status == null || !PrescriptionStatus.deliverable().contains(status)) {
            return isDeliverable();
        }

        return hasStatusIn(List.of(status));
    }

    private static Specification<PrescriptionItem> hasStatusIn(List<PrescriptionStatus> statuses) {
        return (root, query, builder) -> builder.and(
                root.get("status").in(statuses),
                builder.isNull(root.get("delivery")));
    }

    public static Specification<PrescriptionItem> associatedWithCompanyMember(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("prescription").join("patient").join("company").join("users").get("id"), userId);
    }

    public static Specification<PrescriptionItem> associatedWithPatientUser(UUID userId) {
        return (root, query, builder) -> builder.equal(
                root.join("prescription").join("patient").join("user").get("id"), userId);
    }

    public static Specification<PrescriptionItem> hasCompanyId(UUID companyId) {
        if (companyId == null) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.equal(
                root.join("prescription").join("patient").join("company").get("id"), companyId);
    }

    public static Specification<PrescriptionItem> hasPatientName(String patientName) {
        if (!StringUtils.hasText(patientName)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("prescription").join("patient").get("name")),
                "%" + patientName.toLowerCase() + "%");
    }

    public static Specification<PrescriptionItem> hasPatientCpf(String patientCpf) {
        if (!StringUtils.hasText(patientCpf)) {
            return Specification.unrestricted();
        }

        return (root, query, builder) -> builder.like(
                builder.lower(root.join("prescription").join("patient").get("cpf")),
                "%" + patientCpf.toLowerCase() + "%");
    }
}
