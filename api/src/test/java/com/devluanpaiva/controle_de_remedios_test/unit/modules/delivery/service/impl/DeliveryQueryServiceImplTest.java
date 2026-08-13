package com.devluanpaiva.controle_de_remedios_test.unit.modules.delivery.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.policy.DeliveryAuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl.DeliveryQueryServiceImpl;
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
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryQueryServiceImpl")
class DeliveryQueryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private DeliveryQueryServiceImpl deliveryQueryService;

    @BeforeEach
    void setUp() {
        deliveryQueryService = new DeliveryQueryServiceImpl(
                deliveryRepository, prescriptionItemRepository, prescriptionRepository, patientRepository,
                medicineRepository, new DeliveryMapper(), new PendingDeliveryItemMapper(),
                new DeliveryAuthorizationPolicy(new AuthorizationPolicy(), companyRepository),
                securityContextHelper);
    }

    private Company buildCompany() {
        return Company.builder()
                .id(UUID.randomUUID())
                .name("Acme")
                .slug("acme")
                .cnpj("11222333000181")
                .active(true)
                .build();
    }

    private User buildUser(UserRole role) {
        return User.builder()
                .id(UUID.randomUUID())
                .name("User " + role.name())
                .email(role.name().toLowerCase() + "." + UUID.randomUUID() + "@example.com")
                .password("encoded-password")
                .cpf("11144477735")
                .role(role)
                .active(true)
                .build();
    }

    private PrescriptionItem buildItem(Company company) {
        Patient patient = Patient.builder().id(UUID.randomUUID()).company(company).name("John Doe").build();
        Medicine medicine = Medicine.builder()
                .id(UUID.randomUUID()).name("Glifage XR").company(company).build();
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).patient(patient).build();

        PrescriptionItem item = PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.PENDING)
                .prescribedQuantity(30)
                .treatmentDays(30)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .build();

        prescription.getItems().add(item);

        return item;
    }

    private Delivery buildDelivery(Company company, PrescriptionItem item, User deliverer) {
        return Delivery.builder()
                .id(UUID.randomUUID())
                .company(company)
                .patient(item.getPrescription().getPatient())
                .prescriptionItem(item)
                .deliverer(deliverer)
                .deliveryDate(LocalDate.now())
                .deliveryQuantity(30)
                .build();
    }

    @Nested
    @DisplayName("listDeliveries")
    class ListDeliveries {

        @Test
        @DisplayName("should throw 400 when companyId is not provided")
        void shouldThrowWhenCompanyIdIsMissing() {
            User admin = buildUser(UserRole.ADMIN);
            DeliveryFilter filter = new DeliveryFilter(null, null, null, null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);

            assertThatThrownBy(() -> deliveryQueryService.listDeliveries(filter, PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(businessException.getCode()).isEqualTo("COMPANY_ID_REQUIRED");
                    });

            verify(deliveryRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should list deliveries scoped by the provided companyId")
        void shouldListDeliveriesScopedByCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            Delivery delivery = buildDelivery(company, buildItem(company), null);
            DeliveryFilter filter = new DeliveryFilter(company.getId(), null, null, null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(delivery)));

            Page<DeliveryResponseDTO> result = deliveryQueryService.listDeliveries(filter, PageRequest.of(0, 20));

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).companyId()).isEqualTo(company.getId());
        }
    }

    @Nested
    @DisplayName("listDeliveriesOfCurrentPatient")
    class ListDeliveriesOfCurrentPatient {

        @Test
        @DisplayName("should throw 403 when the actor is not a patient")
        void shouldThrowWhenActorIsNotPatient() {
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);

            assertThatThrownBy(() -> deliveryQueryService.listDeliveriesOfCurrentPatient(PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                    });

            verify(deliveryRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should list the deliveries belonging to the logged-in patient")
        void shouldListDeliveriesForTheLoggedInPatient() {
            User patientUser = buildUser(UserRole.PATIENT);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company);
            item.getPrescription().getPatient().setUser(patientUser);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(buildDelivery(company, item, null))));

            Page<DeliveryResponseDTO> result = deliveryQueryService
                    .listDeliveriesOfCurrentPatient(PageRequest.of(0, 20));

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).companyId()).isEqualTo(company.getId());
        }
    }

    @Nested
    @DisplayName("listPendingDeliveryItems")
    class ListPendingDeliveryItems {

        @Test
        @DisplayName("should throw 400 when companyId is not provided")
        void shouldThrowWhenCompanyIdIsMissing() {
            User admin = buildUser(UserRole.ADMIN);
            PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(null, null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);

            assertThatThrownBy(() -> deliveryQueryService.listPendingDeliveryItems(filter, PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                        assertThat(businessException.getCode()).isEqualTo("COMPANY_ID_REQUIRED");
                    });

            verify(prescriptionItemRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @Test
        @DisplayName("should throw 403 when the actor is not a member of the company")
        void shouldThrowWhenActorIsNotMemberOfCompany() {
            User manager = buildUser(UserRole.MANAGER);
            Company company = buildCompany();
            PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(company.getId(), null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), manager.getId())).thenReturn(false);

            assertThatThrownBy(() -> deliveryQueryService.listPendingDeliveryItems(filter, PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                    });
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should list pending items scoped by the provided companyId")
        void shouldListPendingItemsScopedByCompany() {
            User admin = buildUser(UserRole.ADMIN);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company);
            item.getPrescription().setIssueDate(LocalDate.of(2026, 1, 10));
            PendingDeliveryItemFilter filter = new PendingDeliveryItemFilter(company.getId(), null, null, null);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item)));

            Page<PendingDeliveryItemResponseDTO> result = deliveryQueryService
                    .listPendingDeliveryItems(filter, PageRequest.of(0, 20));

            assertThat(result.getContent()).hasSize(1);

            PendingDeliveryItemResponseDTO dto = result.getContent().get(0);
            assertThat(dto.prescriptionItemId()).isEqualTo(item.getId());
            assertThat(dto.prescriptionId()).isEqualTo(item.getPrescription().getId());
            assertThat(dto.patientId()).isEqualTo(item.getPrescription().getPatient().getId());
            assertThat(dto.issueDate()).isEqualTo(LocalDate.of(2026, 1, 10));
            assertThat(dto.medicineName()).isEqualTo(item.getMedicine().getName());
            assertThat(dto.prescribedQuantity()).isEqualTo(30);
        }
    }

    @Nested
    @DisplayName("listPendingItemsOfCurrentPatient")
    class ListPendingItemsOfCurrentPatient {

        @Test
        @DisplayName("should throw 403 when the actor is not a patient")
        void shouldThrowWhenActorIsNotPatient() {
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);

            assertThatThrownBy(() -> deliveryQueryService.listPendingItemsOfCurrentPatient(PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                    });

            verify(prescriptionItemRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should list the pending items belonging to the logged-in patient")
        void shouldListPendingItemsForTheLoggedInPatient() {
            User patientUser = buildUser(UserRole.PATIENT);
            PrescriptionItem item = buildItem(buildCompany());
            item.getPrescription().getPatient().setUser(patientUser);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item)));

            Page<PendingDeliveryItemResponseDTO> result = deliveryQueryService
                    .listPendingItemsOfCurrentPatient(PageRequest.of(0, 20));

            assertThat(result.getContent()).hasSize(1);

            PendingDeliveryItemResponseDTO dto = result.getContent().get(0);
            assertThat(dto.prescriptionItemId()).isEqualTo(item.getId());
            assertThat(dto.status()).isEqualTo(PrescriptionStatus.PENDING);
            assertThat(dto.medicineName()).isEqualTo(item.getMedicine().getName());
        }
    }

    @Nested
    @DisplayName("listOutForDeliveryItemsOfCurrentDeliverer")
    class ListOutForDeliveryItemsOfCurrentDeliverer {

        @Test
        @DisplayName("should throw 403 when the actor is not a deliverer")
        void shouldThrowWhenActorIsNotDeliverer() {
            User manager = buildUser(UserRole.MANAGER);

            when(securityContextHelper.getCurrentUser()).thenReturn(manager);

            assertThatThrownBy(
                    () -> deliveryQueryService.listOutForDeliveryItemsOfCurrentDeliverer(PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                    });

            verify(prescriptionItemRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should expose the patient address and contact so the deliverer can reach the destination")
        void shouldExposePatientAddressAndContact() {
            User deliverer = buildUser(UserRole.DELIVERER);
            PrescriptionItem item = buildItem(buildCompany());
            item.setStatus(PrescriptionStatus.OUT_FOR_DELIVERY);
            item.getPrescription().getPatient().setAddress("Rua das Flores, 100");
            item.getPrescription().getPatient().setContact("85999990000");

            when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);
            when(prescriptionItemRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item)));

            Page<PendingDeliveryItemResponseDTO> result = deliveryQueryService
                    .listOutForDeliveryItemsOfCurrentDeliverer(PageRequest.of(0, 20));

            PendingDeliveryItemResponseDTO dto = result.getContent().get(0);
            assertThat(dto.patientAddress()).isEqualTo("Rua das Flores, 100");
            assertThat(dto.patientContact()).isEqualTo("85999990000");
            assertThat(dto.status()).isEqualTo(PrescriptionStatus.OUT_FOR_DELIVERY);
        }
    }

    @Nested
    @DisplayName("listDeliveriesCompletedByCurrentDeliverer")
    class ListDeliveriesCompletedByCurrentDeliverer {

        @Test
        @DisplayName("should throw 403 when the actor is not a deliverer")
        void shouldThrowWhenActorIsNotDeliverer() {
            User assistant = buildUser(UserRole.ASSISTANT);

            when(securityContextHelper.getCurrentUser()).thenReturn(assistant);

            assertThatThrownBy(
                    () -> deliveryQueryService.listDeliveriesCompletedByCurrentDeliverer(PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

            verify(deliveryRepository, never()).findAll(any(Specification.class), any(Pageable.class));
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("should expose the deliverer that completed each delivery")
        void shouldExposeTheDelivererOfEachDelivery() {
            User deliverer = buildUser(UserRole.DELIVERER);
            Company company = buildCompany();
            Delivery delivery = buildDelivery(company, buildItem(company), deliverer);

            when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);
            when(deliveryRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(delivery)));

            Page<DeliveryResponseDTO> result = deliveryQueryService
                    .listDeliveriesCompletedByCurrentDeliverer(PageRequest.of(0, 20));

            assertThat(result.getContent()).singleElement().satisfies(dto -> {
                assertThat(dto.delivererId()).isEqualTo(deliverer.getId());
                assertThat(dto.delivererName()).isEqualTo(deliverer.getName());
            });
        }
    }
}
