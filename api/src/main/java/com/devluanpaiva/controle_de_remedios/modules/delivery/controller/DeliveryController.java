package com.devluanpaiva.controle_de_remedios.modules.delivery.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.EligiblePrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryQueryService;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryService;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {
    private final DeliveryService deliveryService;
    private final DeliveryQueryService deliveryQueryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DeliveryResponseDTO> createDelivery(@RequestBody @Valid CreateDeliveryRequestDTO dto) {
        return ApiResponseFactory.success("Entrega registrada com sucesso", deliveryService.createDelivery(dto));
    }

    @GetMapping("/{id}")
    public ApiResponse<DeliveryResponseDTO> getDeliveryById(@PathVariable UUID id) {
        return ApiResponseFactory.success("Entrega encontrada com sucesso", deliveryQueryService.getDeliveryById(id));
    }

    @GetMapping
    public ApiResponse<List<DeliveryResponseDTO>> getDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID medicineId,
            @RequestParam(required = false) String medicineName,
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) String patientEmail,
            @RequestParam(required = false) String patientCpf) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        DeliveryFilter filter = new DeliveryFilter(
                companyId, patientId, medicineId, medicineName, patientName, patientEmail, patientCpf);
        Page<DeliveryResponseDTO> result = deliveryQueryService.listDeliveries(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated("Lista de entregas obtida com sucesso", result, next, previous);
    }

    @GetMapping("/me")
    public ApiResponse<List<DeliveryResponseDTO>> getMyDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<DeliveryResponseDTO> result = deliveryQueryService.listDeliveriesOfCurrentPatient(pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated("Lista das suas entregas obtida com sucesso", result, next, previous);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }

    @GetMapping("/pending-items")
    public ApiResponse<List<PendingDeliveryItemResponseDTO>> getPendingDeliveryItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) String patientCpf,
            @RequestParam(required = false) PrescriptionStatus status) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.ASC, "requestedAt"));
        PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(companyId, patientName, patientCpf, status);
        Page<PendingDeliveryItemResponseDTO> result = deliveryQueryService.listPendingDeliveryItems(filter, pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista de itens pendentes de entrega obtida com sucesso", result, next, previous);
    }

    @GetMapping("/me/pending-items")
    public ApiResponse<List<PendingDeliveryItemResponseDTO>> getMyPendingDeliveryItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.ASC, "requestedAt"));
        Page<PendingDeliveryItemResponseDTO> result = deliveryQueryService.listPendingItemsOfCurrentPatient(pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista dos seus itens pendentes de entrega obtida com sucesso", result, next, previous);
    }

    @GetMapping("/me/out-for-delivery")
    public ApiResponse<List<PendingDeliveryItemResponseDTO>> getMyOutForDeliveryItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.ASC, "outForDeliveryAt"));
        Page<PendingDeliveryItemResponseDTO> result = deliveryQueryService.listOutForDeliveryItemsOfCurrentDeliverer(pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista das suas entregas pendentes obtida com sucesso", result, next, previous);
    }

    @GetMapping("/me/completed")
    public ApiResponse<List<DeliveryResponseDTO>> getMyCompletedDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.DESC, "deliveryDate"));
        Page<DeliveryResponseDTO> result = deliveryQueryService.listDeliveriesCompletedByCurrentDeliverer(pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated(
                "Lista das entregas realizadas obtida com sucesso", result, next, previous);
    }

    @GetMapping("/pending-queue/{medicineId}")
    public ApiResponse<List<PendingQueueItemResponseDTO>> getPendingQueue(@PathVariable UUID medicineId) {
        return ApiResponseFactory.list(
                "Fila de entregas pendentes obtida com sucesso", deliveryQueryService.getPendingQueue(medicineId));
    }

    @GetMapping("/eligible-prescriptions")
    public ApiResponse<List<EligiblePrescriptionResponseDTO>> getEligiblePrescriptions(
            @RequestParam UUID companyId, @RequestParam String cpf) {
        return ApiResponseFactory.list(
                "Receitas elegíveis para entrega obtidas com sucesso",
                deliveryQueryService.getEligiblePrescriptions(companyId, cpf));
    }

    @PostMapping("/prescriptions/{prescriptionId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<DeliveryResponseDTO>> deliverAllPendingItems(@PathVariable UUID prescriptionId) {
        return ApiResponseFactory.list(
                "Receita entregue com sucesso", deliveryService.deliverAllPendingItems(prescriptionId));
    }

    @PostMapping("/dispatches/{prescriptionItemId}")
    public ApiResponse<PendingDeliveryItemResponseDTO> dispatchForDelivery(@PathVariable UUID prescriptionItemId) {
        return ApiResponseFactory.success(
                "Item enviado para entrega com sucesso", deliveryService.dispatchForDelivery(prescriptionItemId));
    }

    @PostMapping("/dispatches/prescriptions/{prescriptionId}")
    public ApiResponse<List<PendingDeliveryItemResponseDTO>> dispatchAllPendingItems(
            @PathVariable UUID prescriptionId) {
        return ApiResponseFactory.list(
                "Receita enviada para entrega com sucesso", deliveryService.dispatchAllPendingItems(prescriptionId));
    }

    @PatchMapping("/reservations/{prescriptionItemId}")
    public ApiResponse<PrescriptionItemResponseDTO> reserveStock(
            @PathVariable UUID prescriptionItemId, @RequestBody @Valid ReserveStockRequestDTO dto) {
        return ApiResponseFactory.success(
                "Estoque reservado com sucesso", deliveryService.reserveStock(prescriptionItemId, dto));
    }
}
