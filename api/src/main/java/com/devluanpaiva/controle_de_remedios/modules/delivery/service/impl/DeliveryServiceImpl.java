package com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.policy.DeliveryAuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryService;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryTransitionService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DeliveryMapper deliveryMapper;
    private final PendingDeliveryItemMapper pendingDeliveryItemMapper;
    private final PrescriptionItemMapper prescriptionItemMapper;
    private final DeliveryTransitionService deliveryTransitionService;
    private final DeliveryAuthorizationPolicy deliveryAuthorizationPolicy;
    private final SecurityContextHelper securityContextHelper;

    @Override
    @Transactional
    public DeliveryResponseDTO createDelivery(CreateDeliveryRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        PrescriptionItem item = lockPrescriptionItemOrThrow(dto.prescriptionItemId());
        Patient patient = item.getPrescription().getPatient();

        deliveryAuthorizationPolicy.requireFulfillerOf(actor, patient);
        assertQuantityWithinPrescribed(item, dto.deliveryQuantity());

        Delivery delivery = deliveryTransitionService.registerDelivery(
                item, resolveDeliverer(actor, item), dto.deliveryDate(), dto.deliveryQuantity());

        return deliveryMapper.toResponseDTO(delivery);
    }

    @Override
    @Transactional
    public List<DeliveryResponseDTO> deliverAllPendingItems(UUID prescriptionId) {
        Prescription prescription = findManageablePrescriptionOrThrow(prescriptionId);
        LocalDate today = LocalDate.now();

        return openItems(prescription, PrescriptionStatus.deliverable()).stream()
                .map(item -> deliveryTransitionService.registerDelivery(
                        item, null, today, item.getPrescribedQuantity()))
                .map(deliveryMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public PendingDeliveryItemResponseDTO dispatchForDelivery(UUID prescriptionItemId) {
        User actor = securityContextHelper.getCurrentUser();
        PrescriptionItem item = lockPrescriptionItemOrThrow(prescriptionItemId);

        deliveryAuthorizationPolicy.requireStaffOf(actor, item.getPrescription().getPatient());

        return pendingDeliveryItemMapper.toResponseDTO(deliveryTransitionService.markOutForDelivery(item));
    }

    @Override
    @Transactional
    public List<PendingDeliveryItemResponseDTO> dispatchAllPendingItems(UUID prescriptionId) {
        Prescription prescription = findManageablePrescriptionOrThrow(prescriptionId);

        return openItems(prescription, PrescriptionStatus.dispatchable()).stream()
                .map(deliveryTransitionService::markOutForDelivery)
                .map(pendingDeliveryItemMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public PrescriptionItemResponseDTO reserveStock(UUID prescriptionItemId, ReserveStockRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();
        PrescriptionItem item = lockPrescriptionItemOrThrow(prescriptionItemId);

        deliveryAuthorizationPolicy.requireStaffOf(actor, item.getPrescription().getPatient());

        int reservedQuantity = item.getReceivedQuantity() + dto.quantity();
        assertReservationWithinPrescribed(item, reservedQuantity);

        item.setReceivedQuantity(reservedQuantity);

        return prescriptionItemMapper.toResponseDTO(prescriptionItemRepository.save(item));
    }

    private User resolveDeliverer(User actor, PrescriptionItem item) {
        if (actor.getRole() != UserRole.DELIVERER) {
            return null;
        }

        if (item.getStatus() != PrescriptionStatus.OUT_FOR_DELIVERY) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Item de receita não está em rota de entrega",
                    "PRESCRIPTION_ITEM_NOT_OUT_FOR_DELIVERY",
                    "prescriptionItemId",
                    "O item precisa ser enviado para entrega antes de ser entregue pelo entregador.");
        }

        return actor;
    }

    private List<PrescriptionItem> openItems(Prescription prescription, List<PrescriptionStatus> statuses) {
        return prescription.getItems().stream()
                .filter(item -> item.getDelivery() == null && statuses.contains(item.getStatus()))
                .toList();
    }

    private void assertQuantityWithinPrescribed(PrescriptionItem item, int deliveryQuantity) {
        if (deliveryQuantity <= item.getPrescribedQuantity()) {
            return;
        }

        throw new BusinessException(
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Quantidade de entrega inválida",
                "DELIVERY_QUANTITY_EXCEEDS_PRESCRIBED_QUANTITY",
                "deliveryQuantity",
                "A quantidade entregue não pode ser maior que a quantidade prescrita.");
    }

    private void assertReservationWithinPrescribed(PrescriptionItem item, int reservedQuantity) {
        if (reservedQuantity <= item.getPrescribedQuantity()) {
            return;
        }

        throw new BusinessException(
                HttpStatus.UNPROCESSABLE_CONTENT,
                "Reserva de estoque inválida",
                "RESERVATION_EXCEEDS_PRESCRIBED_QUANTITY",
                "quantity",
                "A quantidade reservada não pode ultrapassar a quantidade prescrita.");
    }

    private Prescription findManageablePrescriptionOrThrow(UUID prescriptionId) {
        User actor = securityContextHelper.getCurrentUser();

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Receita não encontrada",
                        "PRESCRIPTION_NOT_FOUND",
                        "prescriptionId",
                        "Não foi possível encontrar uma receita com o ID '" + prescriptionId + "'."));

        deliveryAuthorizationPolicy.requireStaffOf(actor, prescription.getPatient());

        return prescription;
    }

    private PrescriptionItem lockPrescriptionItemOrThrow(UUID id) {
        return prescriptionItemRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Item de receita não encontrado",
                        "PRESCRIPTION_ITEM_NOT_FOUND",
                        "prescriptionItemId",
                        "Não foi possível encontrar um item de receita com o ID '" + id + "'."));
    }
}
