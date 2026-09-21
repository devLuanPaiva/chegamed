package com.devluanpaiva.controle_de_remedios.modules.patient.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreateVisitorRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PublicCompanySummaryDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.VisitorRegistrationRequestResponseDTO;

public interface PatientRegistrationRequestService {
    PublicCompanySummaryDTO getPublicCompany(String slug);

    void createRegistrationRequest(String slug, CreatePatientRegistrationRequestDTO dto);

    List<PublicCompanySummaryDTO> getCompaniesOpenForRegistration();

    VisitorRegistrationRequestResponseDTO createVisitorRegistrationRequest(CreateVisitorRegistrationRequestDTO dto);

    Optional<VisitorRegistrationRequestResponseDTO> getLatestVisitorRegistrationRequest();

    Page<PatientRegistrationRequestResponseDTO> getPendingRequests(Pageable pageable);

    PatientResponseDTO approveRequest(UUID id);

    void rejectRequest(UUID id);
}
