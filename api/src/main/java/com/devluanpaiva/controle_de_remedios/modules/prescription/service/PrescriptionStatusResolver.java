package com.devluanpaiva.controle_de_remedios.modules.prescription.service;

import java.util.List;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@Component
public class PrescriptionStatusResolver {
    public PrescriptionStatus resolve(Prescription prescription) {
        List<PrescriptionStatus> activeStatuses = prescription.getItems().stream()
                .map(PrescriptionItem::getStatus)
                .filter(status -> status != PrescriptionStatus.CANCELED)
                .toList();

        if (activeStatuses.isEmpty()) {
            return PrescriptionStatus.CANCELED;
        }

        if (activeStatuses.stream().allMatch(status -> status == PrescriptionStatus.DELIVERED)) {
            return PrescriptionStatus.DELIVERED;
        }

        if (activeStatuses.stream().anyMatch(PrescriptionStatus.fulfilled()::contains)) {
            return PrescriptionStatus.PARTIAL_DELIVERED;
        }

        if (activeStatuses.contains(PrescriptionStatus.OUT_FOR_DELIVERY)) {
            return PrescriptionStatus.OUT_FOR_DELIVERY;
        }

        return PrescriptionStatus.PENDING;
    }
}
