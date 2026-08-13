package com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.EligiblePrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.EligiblePrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliverySpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemSpecification;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.policy.DeliveryAuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryQueryService;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryQueryServiceImpl implements DeliveryQueryService {
    private static final List<PrescriptionStatus> ELIGIBLE_PRESCRIPTION_STATUSES = List.of(
            PrescriptionStatus.PENDING,
            PrescriptionStatus.OUT_FOR_DELIVERY,
            PrescriptionStatus.PARTIAL_DELIVERED);

    private final DeliveryRepository deliveryRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;
    private final DeliveryMapper deliveryMapper;
    private final PendingDeliveryItemMapper pendingDeliveryItemMapper;
    private final DeliveryAuthorizationPolicy deliveryAuthorizationPolicy;
    private final SecurityContextHelper securityContextHelper;

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponseDTO getDeliveryById(UUID id) {
        User actor = securityContextHelper.getCurrentUser();
        Delivery delivery = findDeliveryOrThrow(id);

        deliveryAuthorizationPolicy.requireViewerOf(actor, delivery.getPatient());

        return deliveryMapper.toResponseDTO(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeliveryResponseDTO> listDeliveries(DeliveryFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        assertCompanyIdPresent(filter.companyId());

        Specification<Delivery> specification = visibilityScope(actor)
                .and(DeliverySpecification.hasCompanyId(filter.companyId()))
                .and(DeliverySpecification.hasPatientId(filter.patientId()))
                .and(DeliverySpecification.hasMedicineId(filter.medicineId()))
                .and(DeliverySpecification.hasMedicineName(filter.medicineName()))
                .and(DeliverySpecification.hasPatientName(filter.patientName()))
                .and(DeliverySpecification.hasPatientEmail(filter.patientEmail()))
                .and(DeliverySpecification.hasPatientCpf(filter.patientCpf()));

        return deliveryRepository.findAll(specification, pageable).map(deliveryMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeliveryResponseDTO> listDeliveriesOfCurrentPatient(Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        deliveryAuthorizationPolicy.requireRole(actor, UserRole.PATIENT);

        return deliveryRepository
                .findAll(DeliverySpecification.associatedWithPatientUser(actor.getId()), pageable)
                .map(deliveryMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PendingDeliveryItemResponseDTO> listPendingDeliveryItems(
            PendingDeliveryItemFilter filter, Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        assertCompanyIdPresent(filter.companyId());
        deliveryAuthorizationPolicy.requireStaffOfCompany(actor, filter.companyId());

        Specification<PrescriptionItem> specification = PendingDeliveryItemSpecification
                .atDeliveryStage(filter.status())
                .and(PendingDeliveryItemSpecification.hasCompanyId(filter.companyId()))
                .and(PendingDeliveryItemSpecification.hasPatientName(filter.patientName()))
                .and(PendingDeliveryItemSpecification.hasPatientCpf(filter.patientCpf()));

        return prescriptionItemRepository.findAll(specification, pageable)
                .map(pendingDeliveryItemMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PendingDeliveryItemResponseDTO> listPendingItemsOfCurrentPatient(Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        deliveryAuthorizationPolicy.requireRole(actor, UserRole.PATIENT);

        Specification<PrescriptionItem> specification = PendingDeliveryItemSpecification.isDeliverable()
                .and(PendingDeliveryItemSpecification.associatedWithPatientUser(actor.getId()));

        return prescriptionItemRepository.findAll(specification, pageable)
                .map(pendingDeliveryItemMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PendingDeliveryItemResponseDTO> listOutForDeliveryItemsOfCurrentDeliverer(Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        deliveryAuthorizationPolicy.requireRole(actor, UserRole.DELIVERER);

        Specification<PrescriptionItem> specification = PendingDeliveryItemSpecification.isOutForDelivery()
                .and(PendingDeliveryItemSpecification.associatedWithCompanyMember(actor.getId()));

        return prescriptionItemRepository.findAll(specification, pageable)
                .map(pendingDeliveryItemMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DeliveryResponseDTO> listDeliveriesCompletedByCurrentDeliverer(Pageable pageable) {
        User actor = securityContextHelper.getCurrentUser();

        deliveryAuthorizationPolicy.requireRole(actor, UserRole.DELIVERER);

        return deliveryRepository.findAll(DeliverySpecification.deliveredBy(actor.getId()), pageable)
                .map(deliveryMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingQueueItemResponseDTO> getPendingQueue(UUID medicineId) {
        User actor = securityContextHelper.getCurrentUser();
        Medicine medicine = findMedicineOrThrow(medicineId);

        deliveryAuthorizationPolicy.requireStaffOfCompany(actor, medicine.getCompany().getId());

        return prescriptionItemRepository
                .findByMedicine_IdAndStatusInAndDeliveryIsNullOrderByCreatedAtAsc(
                        medicineId, PrescriptionStatus.deliverable())
                .stream()
                .map(item -> toPendingQueueItemResponseDTO(item, medicine))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EligiblePrescriptionResponseDTO> getEligiblePrescriptions(UUID companyId, String cpf) {
        User actor = securityContextHelper.getCurrentUser();
        Patient patient = findPatientByCpfOrThrow(companyId, cpf);

        deliveryAuthorizationPolicy.requireStaffOf(actor, patient);

        return prescriptionRepository
                .findByPatient_IdAndStatusInOrderByIssueDateDesc(patient.getId(), ELIGIBLE_PRESCRIPTION_STATUSES)
                .stream()
                .map(this::toEligiblePrescriptionResponseDTO)
                .toList();
    }

    private Specification<Delivery> visibilityScope(User actor) {
        return switch (actor.getRole()) {
            case ADMIN -> Specification.unrestricted();
            case MANAGER, ASSISTANT -> DeliverySpecification.associatedWithManager(actor.getId());
            case DELIVERER -> DeliverySpecification.deliveredBy(actor.getId());
            case PATIENT -> DeliverySpecification.associatedWithPatientUser(actor.getId());
        };
    }

    private PendingQueueItemResponseDTO toPendingQueueItemResponseDTO(PrescriptionItem item, Medicine medicine) {
        return new PendingQueueItemResponseDTO(
                item.getId(),
                item.getPrescription().getPatient().getId(),
                item.getPrescription().getPatient().getName(),
                medicine.getId(),
                medicine.getName(),
                item.getPrescribedQuantity(),
                item.getReceivedQuantity(),
                item.getPrescribedQuantity() - item.getReceivedQuantity(),
                item.getRequestedAt());
    }

    private EligiblePrescriptionResponseDTO toEligiblePrescriptionResponseDTO(Prescription prescription) {
        String coverImageUrl = prescription.getImageUrls().isEmpty() ? null : prescription.getImageUrls().get(0);

        List<EligiblePrescriptionItemResponseDTO> items = prescription.getItems().stream()
                .map(item -> new EligiblePrescriptionItemResponseDTO(
                        item.getId(),
                        item.getStatus(),
                        item.getDosage(),
                        item.getUnityType(),
                        item.getReceivedQuantity(),
                        item.getDeliveredQuantity(),
                        item.getMedicine().getName(),
                        item.getMedicine().getEanCode()))
                .toList();

        return new EligiblePrescriptionResponseDTO(
                prescription.getId(), coverImageUrl, prescription.getIssueDate(), items);
    }

    private void assertCompanyIdPresent(UUID companyId) {
        if (companyId != null) {
            return;
        }

        throw new BusinessException(
                HttpStatus.BAD_REQUEST,
                "Parâmetro obrigatório ausente",
                "COMPANY_ID_REQUIRED",
                "companyId",
                "O parâmetro 'companyId' é obrigatório.");
    }

    private Patient findPatientByCpfOrThrow(UUID companyId, String cpf) {
        return patientRepository.findByCompany_IdAndCpf(companyId, cpf)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Paciente não encontrado",
                        "PATIENT_NOT_FOUND",
                        "cpf",
                        "Não foi possível encontrar um paciente com o CPF informado nesta empresa."));
    }

    private Delivery findDeliveryOrThrow(UUID id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Entrega não encontrada",
                        "DELIVERY_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar uma entrega com o ID '" + id + "'."));
    }

    private Medicine findMedicineOrThrow(UUID id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Medicamento não encontrado",
                        "MEDICINE_NOT_FOUND",
                        "medicineId",
                        "Não foi possível encontrar um medicamento com o ID '" + id + "'."));
    }
}
