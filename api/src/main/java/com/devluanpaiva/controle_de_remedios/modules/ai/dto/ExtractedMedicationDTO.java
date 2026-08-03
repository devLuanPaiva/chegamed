package com.devluanpaiva.controle_de_remedios.modules.ai.dto;

import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.TreatmentType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;

public record ExtractedMedicationDTO(
        String name,
        String eanCode,
        String dosage,
        Integer prescribedQuantity,
        UnityType unityType,
        TreatmentType treatmentType,
        Integer treatmentDays) {
}
