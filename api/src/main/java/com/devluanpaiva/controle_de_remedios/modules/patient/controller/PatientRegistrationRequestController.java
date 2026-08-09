package com.devluanpaiva.controle_de_remedios.modules.patient.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientRegistrationRequestResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.dto.PatientResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.patient.service.PatientRegistrationRequestService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/patient-registration-requests")
@RequiredArgsConstructor
public class PatientRegistrationRequestController {
    private final PatientRegistrationRequestService patientRegistrationRequestService;

    @GetMapping
    public ApiResponse<List<PatientRegistrationRequestResponseDTO>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size);
        Page<PatientRegistrationRequestResponseDTO> result =
                patientRegistrationRequestService.getPendingRequests(pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de solicitações pendentes obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<PatientResponseDTO> approveRequest(@PathVariable UUID id) {
        return ApiResponseFactory.success(
                "Cadastro aprovado com sucesso", patientRegistrationRequestService.approveRequest(id));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<Void> rejectRequest(@PathVariable UUID id) {
        patientRegistrationRequestService.rejectRequest(id);
        return ApiResponseFactory.success("Cadastro recusado com sucesso", null);
    }
}
