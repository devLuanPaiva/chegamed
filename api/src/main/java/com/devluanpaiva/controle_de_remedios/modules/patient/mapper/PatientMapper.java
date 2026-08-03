package com.devluanpaiva.controle_de_remedios.modules.patient.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.shared.utils.CpfMasker;

@Component
public class PatientMapper {
    public PatientResponseDTO toResponseDTO(Patient patient) {
        return new PatientResponseDTO(
                patient.getId(),
                patient.getName(),
                CpfMasker.mask(patient.getCpf()),
                patient.getBirthdate().toLocalDate(),
                patient.getCompany().getId(),
                patient.getUser() != null ? patient.getUser().getId() : null,
                patient.getContact(),
                patient.getAddress(),
                patient.getCreatedAt(),
                patient.getUpdatedAt());
    }
}
