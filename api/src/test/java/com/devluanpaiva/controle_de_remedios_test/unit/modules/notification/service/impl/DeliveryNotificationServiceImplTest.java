package com.devluanpaiva.controle_de_remedios_test.unit.modules.notification.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.medicine.entity.Medicine;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationCommand;
import com.devluanpaiva.controle_de_remedios.modules.notification.enums.NotificationType;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationService;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.impl.DeliveryNotificationServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("DeliveryNotificationServiceImpl")
class DeliveryNotificationServiceImplTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    private DeliveryNotificationServiceImpl deliveryNotificationService;

    @BeforeEach
    void setUp() {
        deliveryNotificationService = new DeliveryNotificationServiceImpl(notificationService, userRepository);
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

    private PrescriptionItem buildItem(Patient patient) {
        Medicine medicine = Medicine.builder()
                .id(UUID.randomUUID())
                .name("Dipirona")
                .company(patient.getCompany())
                .build();
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).patient(patient).build();

        return PrescriptionItem.builder()
                .id(UUID.randomUUID())
                .prescription(prescription)
                .medicine(medicine)
                .status(PrescriptionStatus.OUT_FOR_DELIVERY)
                .prescribedQuantity(30)
                .treatmentDays(30)
                .receivedQuantity(0)
                .deliveredQuantity(0)
                .build();
    }

    private Patient buildPatient(User patientUser, String address) {
        Company company = Company.builder()
                .id(UUID.randomUUID())
                .name("Acme")
                .slug("acme")
                .cnpj("11222333000181")
                .active(true)
                .build();

        return Patient.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .cpf("52998224725")
                .company(company)
                .user(patientUser)
                .address(address)
                .build();
    }

    private List<NotificationCommand> captureCommands(int expectedCount) {
        ArgumentCaptor<NotificationCommand> commandCaptor = ArgumentCaptor.forClass(NotificationCommand.class);
        verify(notificationService, times(expectedCount)).notify(commandCaptor.capture());
        return commandCaptor.getAllValues();
    }

    @Nested
    @DisplayName("notifyDispatched")
    class NotifyDispatched {

        @Test
        @DisplayName("should notify every deliverer of the pharmacy and the patient")
        void shouldNotifyDeliverersAndPatient() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(patientUser, "Rua das Flores, 100");
            PrescriptionItem item = buildItem(patient);
            User firstDeliverer = buildUser(UserRole.DELIVERER);
            User secondDeliverer = buildUser(UserRole.DELIVERER);

            when(userRepository.findByRoleAndActiveTrueAndCompanies_Id(
                    UserRole.DELIVERER, patient.getCompany().getId()))
                    .thenReturn(List.of(firstDeliverer, secondDeliverer));

            deliveryNotificationService.notifyDispatched(item);

            List<NotificationCommand> commands = captureCommands(3);

            assertThat(commands)
                    .filteredOn(command -> command.type() == NotificationType.DELIVERY_DISPATCHED)
                    .hasSize(2)
                    .allSatisfy(command -> assertThat(command.body()).contains("Rua das Flores, 100"))
                    .extracting(NotificationCommand::recipient)
                    .containsExactlyInAnyOrder(firstDeliverer, secondDeliverer);

            assertThat(commands)
                    .filteredOn(command -> command.type() == NotificationType.DELIVERY_ON_THE_WAY)
                    .singleElement()
                    .satisfies(command -> assertThat(command.recipient()).isEqualTo(patientUser));
        }

        @Test
        @DisplayName("should tell the deliverer when the patient has no address on file")
        void shouldFallBackWhenPatientHasNoAddress() {
            Patient patient = buildPatient(null, null);
            PrescriptionItem item = buildItem(patient);
            User deliverer = buildUser(UserRole.DELIVERER);

            when(userRepository.findByRoleAndActiveTrueAndCompanies_Id(
                    UserRole.DELIVERER, patient.getCompany().getId()))
                    .thenReturn(List.of(deliverer));

            deliveryNotificationService.notifyDispatched(item);

            assertThat(captureCommands(1))
                    .singleElement()
                    .satisfies(command -> assertThat(command.body()).contains("endereço não informado"));
        }

        @Test
        @DisplayName("should skip the patient notification when the patient has no app account")
        void shouldSkipPatientWithoutAppAccount() {
            Patient patient = buildPatient(null, "Rua das Flores, 100");
            PrescriptionItem item = buildItem(patient);

            when(userRepository.findByRoleAndActiveTrueAndCompanies_Id(
                    UserRole.DELIVERER, patient.getCompany().getId()))
                    .thenReturn(List.of());

            deliveryNotificationService.notifyDispatched(item);

            verify(notificationService, never()).notify(any(NotificationCommand.class));
        }
    }

    @Nested
    @DisplayName("notifyDelivered")
    class NotifyDelivered {

        @Test
        @DisplayName("should tell the patient when the next withdrawal becomes available")
        void shouldTellPatientAboutNextAvailableDate() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(patientUser, "Rua das Flores, 100");
            PrescriptionItem item = buildItem(patient);
            Delivery delivery = Delivery.builder()
                    .id(UUID.randomUUID())
                    .company(patient.getCompany())
                    .patient(patient)
                    .prescriptionItem(item)
                    .deliveryDate(LocalDate.of(2026, 3, 1))
                    .nextAvailableDate(LocalDate.of(2026, 3, 31))
                    .deliveryQuantity(30)
                    .build();

            deliveryNotificationService.notifyDelivered(delivery);

            assertThat(captureCommands(1))
                    .singleElement()
                    .satisfies(command -> {
                        assertThat(command.type()).isEqualTo(NotificationType.DELIVERY_COMPLETED);
                        assertThat(command.recipient()).isEqualTo(patientUser);
                        assertThat(command.body()).contains("31/03/2026");
                    });
        }

        @Test
        @DisplayName("should skip the notification when the patient has no app account")
        void shouldSkipWhenPatientHasNoAppAccount() {
            Patient patient = buildPatient(null, null);
            Delivery delivery = Delivery.builder()
                    .id(UUID.randomUUID())
                    .company(patient.getCompany())
                    .patient(patient)
                    .prescriptionItem(buildItem(patient))
                    .deliveryDate(LocalDate.of(2026, 3, 1))
                    .deliveryQuantity(30)
                    .build();

            deliveryNotificationService.notifyDelivered(delivery);

            verify(notificationService, never()).notify(any(NotificationCommand.class));
        }
    }

    @Nested
    @DisplayName("notifyCanceled")
    class NotifyCanceled {

        @Test
        @DisplayName("should tell the patient that the item was canceled")
        void shouldTellPatientAboutCancellation() {
            User patientUser = buildUser(UserRole.PATIENT);
            Patient patient = buildPatient(patientUser, "Rua das Flores, 100");
            PrescriptionItem item = buildItem(patient);

            deliveryNotificationService.notifyCanceled(item);

            assertThat(captureCommands(1))
                    .singleElement()
                    .satisfies(command -> {
                        assertThat(command.type()).isEqualTo(NotificationType.PRESCRIPTION_ITEM_CANCELED);
                        assertThat(command.recipient()).isEqualTo(patientUser);
                        assertThat(command.body()).contains("Dipirona");
                    });
        }
    }
}
