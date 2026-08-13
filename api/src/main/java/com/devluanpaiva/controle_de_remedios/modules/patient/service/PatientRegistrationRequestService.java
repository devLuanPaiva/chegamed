package com.devluanpaiva.controle_de_remedios.modules.patient.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PublicCompanySummaryDTO;

public interface PatientRegistrationRequestService {
    PublicCompanySummaryDTO getPublicCompany(String slug);

    void createRegistrationRequest(String slug, CreatePatientRegistrationRequestDTO dto);

    Page<PatientRegistrationRequestResponseDTO> getPendingRequests(Pageable pageable);

    PatientResponseDTO approveRequest(UUID id);

    void rejectRequest(UUID id);
}
