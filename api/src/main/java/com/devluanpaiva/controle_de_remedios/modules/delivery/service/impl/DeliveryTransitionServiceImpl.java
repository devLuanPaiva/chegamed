package com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryTransitionService;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.DeliveryNotificationService;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.service.PrescriptionStatusResolver;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryTransitionServiceImpl implements DeliveryTransitionService {
    private final DeliveryRepository deliveryRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionStatusResolver prescriptionStatusResolver;
    private final MedicineMovementService medicineMovementService;
    private final DeliveryNotificationService deliveryNotificationService;

    @Override
    public PrescriptionItem markOutForDelivery(PrescriptionItem item) {
        assertDispatchable(item);

        item.setStatus(PrescriptionStatus.OUT_FOR_DELIVERY);
        item.setOutForDeliveryAt(LocalDateTime.now());

        PrescriptionItem dispatchedItem = prescriptionItemRepository.save(item);

        syncPrescriptionStatus(dispatchedItem.getPrescription());
        deliveryNotificationService.notifyDispatched(dispatchedItem);

        return dispatchedItem;
    }

    @Override
    public Delivery registerDelivery(PrescriptionItem item, User deliverer, LocalDate deliveryDate, int quantity) {
        assertDeliverable(item);

        Delivery delivery = Delivery.builder()
                .company(item.getPrescription().getPatient().getCompany())
                .patient(item.getPrescription().getPatient())
                .prescriptionItem(item)
                .deliverer(deliverer)
                .deliveryDate(deliveryDate)
                .nextAvailableDate(deliveryDate.plusDays(item.getTreatmentDays()))
                .deliveryQuantity(quantity)
                .build();

        Delivery savedDelivery = deliveryRepository.save(delivery);

        item.setDeliveredQuantity(quantity);
        item.setStatus(quantity < item.getPrescribedQuantity()
                ? PrescriptionStatus.PARTIAL_DELIVERED
                : PrescriptionStatus.DELIVERED);
        prescriptionItemRepository.save(item);

        syncPrescriptionStatus(item.getPrescription());

        medicineMovementService.recordDelivered(savedDelivery);
        deliveryNotificationService.notifyDelivered(savedDelivery);

        return savedDelivery;
    }

    private void syncPrescriptionStatus(Prescription prescription) {
        prescription.setStatus(prescriptionStatusResolver.resolve(prescription));
        prescriptionRepository.save(prescription);
    }

    private void assertDispatchable(PrescriptionItem item) {
        if (PrescriptionStatus.dispatchable().contains(item.getStatus())) {
            return;
        }

        throw new BusinessException(
                HttpStatus.CONFLICT,
                "Item de receita não pode ser enviado para entrega",
                "PRESCRIPTION_ITEM_NOT_DISPATCHABLE",
                "prescriptionItemId",
                "O item de receita está com status '" + item.getStatus()
                        + "' e não pode ser enviado para entrega.");
    }

    private void assertDeliverable(PrescriptionItem item) {
        if (item.getDelivery() != null) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Item de receita já entregue",
                    "DELIVERY_ALREADY_EXISTS",
                    "prescriptionItemId",
                    "Já existe uma entrega registrada para este item de receita.");
        }

        if (!PrescriptionStatus.deliverable().contains(item.getStatus())) {
            throw new BusinessException(
                    HttpStatus.CONFLICT,
                    "Item de receita não pode ser entregue",
                    "PRESCRIPTION_ITEM_NOT_DELIVERABLE",
                    "prescriptionItemId",
                    "O item de receita está com status '" + item.getStatus() + "' e não pode ser entregue.");
        }
    }
}
