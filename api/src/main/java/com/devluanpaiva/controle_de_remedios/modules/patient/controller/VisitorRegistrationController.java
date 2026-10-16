package com.devluanpaiva.controle_de_remedios.modules.patient.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreateVisitorRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PublicCompanySummaryDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.VisitorRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.PatientRegistrationRequestService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/visitor")
@RequiredArgsConstructor
public class VisitorRegistrationController {
    private final PatientRegistrationRequestService patientRegistrationRequestService;

    @GetMapping("/companies")
    public ApiResponse<List<PublicCompanySummaryDTO>> getCompaniesOpenForRegistration() {
        return ApiResponseFactory.list(
                "Lista de empresas obtida com sucesso",
                patientRegistrationRequestService.getCompaniesOpenForRegistration());
    }

    @PostMapping("/patient-registration-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<VisitorRegistrationRequestResponseDTO> createRegistrationRequest(
            @RequestBody @Valid CreateVisitorRegistrationRequestDTO dto) {

        return ApiResponseFactory.success(
                "Cadastro enviado com sucesso, aguarde a aprovação da equipe",
                patientRegistrationRequestService.createVisitorRegistrationRequest(dto));
    }

    @GetMapping("/patient-registration-requests/me")
    public ApiResponse<VisitorRegistrationRequestResponseDTO> getLatestRegistrationRequest() {
        return ApiResponseFactory.success(
                "Solicitação de cadastro obtida com sucesso",
                patientRegistrationRequestService.getLatestVisitorRegistrationRequest().orElse(null));
    }
}
