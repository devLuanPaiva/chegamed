package com.devluanpaiva.controle_de_remedios.modules.delivery.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@Component
public class PendingDeliveryItemMapper {
    public PendingDeliveryItemResponseDTO toResponseDTO(PrescriptionItem item) {
        Prescription prescription = item.getPrescription();
        Patient patient = prescription.getPatient();

        return new PendingDeliveryItemResponseDTO(
                item.getId(),
                prescription.getId(),
                patient.getId(),
                patient.getName(),
                patient.getAddress(),
                patient.getContact(),
                prescription.getIssueDate(),
                item.getMedicine().getName(),
                item.getDosage(),
                item.getStatus(),
                item.getUnityType(),
                item.getPrescribedQuantity(),
                item.getOutForDeliveryAt());
    }
}
