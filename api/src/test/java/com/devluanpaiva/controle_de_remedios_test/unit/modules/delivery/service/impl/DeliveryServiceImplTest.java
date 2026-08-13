package com.devluanpaiva.controle_de_remedios_test.unit.modules.delivery.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.DeliveryMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.mapper.PendingDeliveryItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.delivery.policy.DeliveryAuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.DeliveryTransitionService;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl.DeliveryServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.delivery.service.impl.DeliveryTransitionServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.medicine.mapper.MedicineMapper;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.service.MedicineMovementService;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.DeliveryNotificationService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.service.PrescriptionStatusResolver;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.mapper.PrescriptionItemMapper;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryServiceImpl")
class DeliveryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private PrescriptionItemRepository prescriptionItemRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private MedicineMovementService medicineMovementService;

    @Mock
    private DeliveryNotificationService deliveryNotificationService;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private DeliveryServiceImpl deliveryService;

    @BeforeEach
    void setUp() {
        DeliveryTransitionService deliveryTransitionService = new DeliveryTransitionServiceImpl(
                deliveryRepository, prescriptionItemRepository, prescriptionRepository,
                new PrescriptionStatusResolver(), medicineMovementService, deliveryNotificationService);

        deliveryService = new DeliveryServiceImpl(
                prescriptionItemRepository, prescriptionRepository, new DeliveryMapper(),
                new PendingDeliveryItemMapper(), new PrescriptionItemMapper(new MedicineMapper()),
                deliveryTransitionService,
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

    private PrescriptionItem buildItem(Company company, int prescribedQuantity, int treatmentDays) {
        Patient patient = Patient.builder().id(UUID.randomUUID()).company(company).build();
        Medicine medicine = Medicine.builder()
                .id(UUID.randomUUID()).name("Glifage XR").company(company).build();
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).patient(patient).build();

        PrescriptionItem item = PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.PENDING)
                .prescribedQuantity(prescribedQuantity)
                .treatmentDays(treatmentDays)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .build();

        prescription.getItems().add(item);

        return item;
    }

    private void givenLockedItem(PrescriptionItem item) {
        when(prescriptionItemRepository.findByIdForUpdate(item.getId())).thenReturn(Optional.of(item));
    }

    @Nested
    @DisplayName("createDelivery")
    class CreateDelivery {

        @Test
        @DisplayName("should compute nextAvailableDate as deliveryDate plus treatmentDays and mark item as DELIVERED")
        void shouldComputeNextAvailableDateAndMarkAsDelivered() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            LocalDate deliveryDate = LocalDate.now();
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), deliveryDate, 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            DeliveryResponseDTO response = deliveryService.createDelivery(dto);

            assertThat(response.nextAvailableDate()).isEqualTo(deliveryDate.plusDays(30));
            assertThat(response.delivererId()).isNull();
            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
            assertThat(item.getDeliveredQuantity()).isEqualTo(30);
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
        }

        @Test
        @DisplayName("should mark item as PARTIAL_DELIVERED when the delivered quantity is less than prescribed")
        void shouldMarkAsPartialDeliveredWhenQuantityIsLower() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 10);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            deliveryService.createDelivery(dto);

            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
        }

        @Test
        @DisplayName("should mark prescription as PARTIAL_DELIVERED when other items are still pending")
        void shouldMarkPrescriptionAsPartialDeliveredWhenOtherItemsArePending() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            PrescriptionItem otherItem = PrescriptionItem.builder()
                    .id(UUID.randomUUID())
                    .prescription(item.getPrescription())
                    .medicine(item.getMedicine())
                    .status(PrescriptionStatus.PENDING)
                    .prescribedQuantity(10)
                    .treatmentDays(10)
                    .receivedQuantity(0)
                    .deliveredQuantity(0)
                    .build();
            item.getPrescription().getItems().add(otherItem);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            deliveryService.createDelivery(dto);

            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
        }

        @Test
        @DisplayName("should throw 422 when the delivery quantity exceeds the prescribed quantity")
        void shouldThrowWhenDeliveryQuantityExceedsPrescribed() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 40);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
                        assertThat(businessException.getCode())
                                .isEqualTo("DELIVERY_QUANTITY_EXCEEDS_PRESCRIBED_QUANTITY");
                    });
        }

        @Test
        @DisplayName("should throw 409 when the item's status is not deliverable")
        void shouldThrowWhenItemIsNotDeliverable() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            item.setStatus(PrescriptionStatus.CANCELED);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("PRESCRIPTION_ITEM_NOT_DELIVERABLE");
                    });
        }

        @Test
        @DisplayName("should load the item with a write lock so concurrent deliveries cannot duplicate")
        void shouldLoadItemWithWriteLock() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            deliveryService.createDelivery(dto);

            verify(prescriptionItemRepository).findByIdForUpdate(item.getId());
            verify(prescriptionItemRepository, never()).findById(item.getId());
        }
    }

    @Nested
    @DisplayName("createDelivery as a DELIVERER")
    class CreateDeliveryAsDeliverer {

        @Test
        @DisplayName("should record the deliverer on the delivery")
        void shouldRecordDelivererOnDelivery() {
            User deliverer = buildUser(UserRole.DELIVERER);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            item.setStatus(PrescriptionStatus.OUT_FOR_DELIVERY);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);
            givenLockedItem(item);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), deliverer.getId())).thenReturn(true);
            when(deliveryRepository.save(any(Delivery.class))).thenAnswer(invocation -> invocation.getArgument(0));

            DeliveryResponseDTO response = deliveryService.createDelivery(dto);

            assertThat(response.delivererId()).isEqualTo(deliverer.getId());
            assertThat(response.delivererName()).isEqualTo(deliverer.getName());
            assertThat(item.getStatus()).isEqualTo(PrescriptionStatus.DELIVERED);
        }

        @Test
        @DisplayName("should throw 409 when the item was not sent for delivery yet")
        void shouldThrowWhenItemWasNotDispatched() {
            User deliverer = buildUser(UserRole.DELIVERER);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);
            givenLockedItem(item);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), deliverer.getId())).thenReturn(true);

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("PRESCRIPTION_ITEM_NOT_OUT_FOR_DELIVERY");
                    });

            verify(deliveryRepository, never()).save(any(Delivery.class));
        }

        @Test
        @DisplayName("should deny a deliverer that does not belong to the patient's pharmacy")
        void shouldDenyDelivererFromAnotherPharmacy() {
            User deliverer = buildUser(UserRole.DELIVERER);
            Company company = buildCompany();
            PrescriptionItem item = buildItem(company, 30, 30);
            item.setStatus(PrescriptionStatus.OUT_FOR_DELIVERY);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);
            givenLockedItem(item);
            when(companyRepository.existsByIdAndUsers_Id(company.getId(), deliverer.getId())).thenReturn(false);

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(businessException.getCode()).isEqualTo("AUTH_FORBIDDEN");
                    });
        }

        @Test
        @DisplayName("should deny a patient from registering a delivery")
        void shouldDenyPatientFromRegisteringDelivery() {
            User patientUser = buildUser(UserRole.PATIENT);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            CreateDeliveryRequestDTO dto = new CreateDeliveryRequestDTO(item.getId(), LocalDate.now(), 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(patientUser);
            givenLockedItem(item);

            assertThatThrownBy(() -> deliveryService.createDelivery(dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

            verify(deliveryRepository, never()).save(any(Delivery.class));
        }
    }

    @Nested
    @DisplayName("dispatchForDelivery")
    class DispatchForDelivery {

        @Test
        @DisplayName("should move the item to OUT_FOR_DELIVERY and notify the deliverers and the patient")
        void shouldMoveItemToOutForDeliveryAndNotify() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);
            when(prescriptionItemRepository.save(item)).thenReturn(item);

            PendingDeliveryItemResponseDTO response = deliveryService.dispatchForDelivery(item.getId());

            assertThat(response.status()).isEqualTo(PrescriptionStatus.OUT_FOR_DELIVERY);
            assertThat(item.getOutForDeliveryAt()).isNotNull();
            assertThat(item.getPrescription().getStatus()).isEqualTo(PrescriptionStatus.OUT_FOR_DELIVERY);

            verify(deliveryNotificationService).notifyDispatched(item);
            verify(deliveryRepository, never()).save(any(Delivery.class));
        }

        @Test
        @DisplayName("should throw 409 when the item was already sent for delivery")
        void shouldThrowWhenItemWasAlreadyDispatched() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            item.setStatus(PrescriptionStatus.OUT_FOR_DELIVERY);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);

            assertThatThrownBy(() -> deliveryService.dispatchForDelivery(item.getId()))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getCode()).isEqualTo("PRESCRIPTION_ITEM_NOT_DISPATCHABLE");
                    });
        }

        @Test
        @DisplayName("should deny a deliverer from dispatching an item")
        void shouldDenyDelivererFromDispatching() {
            User deliverer = buildUser(UserRole.DELIVERER);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);

            when(securityContextHelper.getCurrentUser()).thenReturn(deliverer);
            givenLockedItem(item);

            assertThatThrownBy(() -> deliveryService.dispatchForDelivery(item.getId()))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.FORBIDDEN));

            verify(deliveryNotificationService, never()).notifyDispatched(any());
        }
    }

    @Nested
    @DisplayName("reserveStock")
    class ReserveStock {

        @Test
        @DisplayName("should increment the item's receivedQuantity")
        void shouldIncrementReceivedQuantity() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            ReserveStockRequestDTO dto = new ReserveStockRequestDTO(20);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);
            when(prescriptionItemRepository.save(item)).thenReturn(item);

            PrescriptionItemResponseDTO response = deliveryService.reserveStock(item.getId(), dto);

            assertThat(response.receivedQuantity()).isEqualTo(20);
        }

        @Test
        @DisplayName("should throw 422 when the reservation would exceed the prescribed quantity")
        void shouldThrowWhenReservationExceedsPrescribedQuantity() {
            User admin = buildUser(UserRole.ADMIN);
            PrescriptionItem item = buildItem(buildCompany(), 30, 30);
            item.setReceivedQuantity(25);
            ReserveStockRequestDTO dto = new ReserveStockRequestDTO(10);

            when(securityContextHelper.getCurrentUser()).thenReturn(admin);
            givenLockedItem(item);

            assertThatThrownBy(() -> deliveryService.reserveStock(item.getId(), dto))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_CONTENT);
                        assertThat(businessException.getCode()).isEqualTo("RESERVATION_EXCEEDS_PRESCRIBED_QUANTITY");
                    });
        }
    }
}
