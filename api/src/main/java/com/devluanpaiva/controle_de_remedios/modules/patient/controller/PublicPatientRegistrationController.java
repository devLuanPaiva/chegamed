package com.devluanpaiva.controle_de_remedios.modules.patient.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.CreatePatientRegistrationRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PublicCompanySummaryDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.PatientRegistrationRequestService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/public/companies")
@RequiredArgsConstructor
public class PublicPatientRegistrationController {
    private final PatientRegistrationRequestService patientRegistrationRequestService;

    @GetMapping("/{slug}")
    public ApiResponse<PublicCompanySummaryDTO> getPublicCompany(@PathVariable String slug) {
        return ApiResponseFactory.success(
                "Empresa encontrada com sucesso", patientRegistrationRequestService.getPublicCompany(slug));
    }

    @PostMapping("/{slug}/patient-registration-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> createRegistrationRequest(
            @PathVariable String slug, @RequestBody @Valid CreatePatientRegistrationRequestDTO dto) {

        patientRegistrationRequestService.createRegistrationRequest(slug, dto);
        return ApiResponseFactory.success("Cadastro enviado com sucesso, aguarde a aprovação da equipe", null);
    }
}
