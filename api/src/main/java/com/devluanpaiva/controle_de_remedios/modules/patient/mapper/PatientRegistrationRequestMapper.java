package com.devluanpaiva.controle_de_remedios.modules.patient.mapper;

import org.springframework.stereotype.Component;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.PatientRegistrationRequest;
import com.devluanpaiva.controle_de_remedios.shared.utils.CpfMasker;

@Component
public class PatientRegistrationRequestMapper {
    public PatientRegistrationRequestResponseDTO toResponseDTO(PatientRegistrationRequest request) {
        return new PatientRegistrationRequestResponseDTO(
                request.getId(),
                request.getCompany().getId(),
                request.getName(),
                CpfMasker.mask(request.getCpf()),
                request.getContact(),
                request.getAddress(),
                request.getEmail(),
                request.getStatus(),
                request.getCreatedAt());
    }
}
