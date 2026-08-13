package com.devluanpaiva.controle_de_remedios_test.unit.modules.dashboard.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
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
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveriesSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.MedicinesSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PatientsSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionsSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.UsersSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.CompanyAccessGuard;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.impl.EntitySummaryServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.delivery.repository.DeliveryRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine.repository.MedicineRepository;
import com.devluanpaiva.controle_de_remedios.modules.medicine_movement.repository.MedicineMovementRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.enums.PatientRegistrationRequestStatus;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRegistrationRequestRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.repository.PrescriptionStatusCount;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("EntitySummaryServiceImpl")
class EntitySummaryServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientRegistrationRequestRepository patientRegistrationRequestRepository;

    @Mock
    private PrescriptionRepository prescriptionRepository;

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineMovementRepository medicineMovementRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyAccessGuard companyAccessGuard;

    private EntitySummaryServiceImpl entitySummaryService;

    @BeforeEach
    void setUp() {
        entitySummaryService = new EntitySummaryServiceImpl(
                patientRepository, patientRegistrationRequestRepository, prescriptionRepository, deliveryRepository,
                medicineRepository, medicineMovementRepository, userRepository, companyAccessGuard);
    }

    private static PrescriptionStatusCount statusCount(PrescriptionStatus status, long count) {
        return new PrescriptionStatusCount() {
            @Override
            public PrescriptionStatus getStatus() {
                return status;
            }

            @Override
            public Long getCount() {
                return count;
            }
        };
    }

    private Delivery buildDelivery() {
        return Delivery.builder().id(UUID.randomUUID()).build();
    }

    @Nested
    @DisplayName("getPatientsSummary")
    class GetPatientsSummary {

        @Test
        @DisplayName("should compose the total, new-this-month, without-account and pending-request counts")
        void shouldComposePatientsSummary() {
            UUID companyId = UUID.randomUUID();

            when(patientRepository.countByCompany_Id(companyId)).thenReturn(50L);
            when(patientRepository.countByCompany_IdAndCreatedAtBetween(eq(companyId), any(), any()))
                    .thenReturn(4L);
            when(patientRepository.countByCompany_IdAndUserIsNull(companyId)).thenReturn(12L);
            when(patientRegistrationRequestRepository
                    .countByCompanyIdAndStatus(companyId, PatientRegistrationRequestStatus.PENDING))
                    .thenReturn(3L);

            PatientsSummaryResponseDTO response = entitySummaryService.getPatientsSummary(companyId);

            verify(companyAccessGuard).assertCanView(companyId);
            assertThat(response.totalCount()).isEqualTo(50L);
            assertThat(response.newThisMonthCount()).isEqualTo(4L);
            assertThat(response.withoutAccountCount()).isEqualTo(12L);
            assertThat(response.pendingRegistrationRequestsCount()).isEqualTo(3L);
        }

        @Test
        @DisplayName("should propagate the guard's rejection and skip repository calls")
        void shouldPropagateGuardRejection() {
            UUID companyId = UUID.randomUUID();
            BusinessException forbidden = new BusinessException(
                    HttpStatus.FORBIDDEN, "Acesso negado", "AUTH_FORBIDDEN", "authorization", "forbidden");
            doThrow(forbidden).when(companyAccessGuard).assertCanView(companyId);

            assertThatThrownBy(() -> entitySummaryService.getPatientsSummary(companyId))
                    .isSameAs(forbidden);

            verifyNoInteractions(patientRepository, patientRegistrationRequestRepository);
        }
    }

    @Nested
    @DisplayName("getPrescriptionsSummary")
    class GetPrescriptionsSummary {

        @Test
        @DisplayName("should sum deliverable statuses as pending and total across all statuses")
        void shouldComposePrescriptionsSummary() {
            UUID companyId = UUID.randomUUID();

            when(prescriptionRepository.countByCompanyGroupedByStatus(companyId)).thenReturn(List.of(
                    statusCount(PrescriptionStatus.PENDING, 5L),
                    statusCount(PrescriptionStatus.OUT_FOR_DELIVERY, 2L),
                    statusCount(PrescriptionStatus.DELIVERED, 10L),
                    statusCount(PrescriptionStatus.PARTIAL_DELIVERED, 1L),
                    statusCount(PrescriptionStatus.CANCELED, 3L)));
            when(prescriptionRepository.countByPatient_Company_IdAndIssueDateBetween(
                    eq(companyId), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(6L);

            PrescriptionsSummaryResponseDTO response = entitySummaryService.getPrescriptionsSummary(companyId);

            verify(companyAccessGuard).assertCanView(companyId);
            assertThat(response.totalCount()).isEqualTo(21L);
            assertThat(response.pendingCount()).isEqualTo(7L);
            assertThat(response.canceledCount()).isEqualTo(3L);
            assertThat(response.issuedThisMonthCount()).isEqualTo(6L);
        }

        @Test
        @DisplayName("should return all-zero counts when the company has no prescriptions")
        void shouldReturnZeroCountsWhenNoPrescriptions() {
            UUID companyId = UUID.randomUUID();

            when(prescriptionRepository.countByCompanyGroupedByStatus(companyId)).thenReturn(List.of());
            when(prescriptionRepository.countByPatient_Company_IdAndIssueDateBetween(
                    eq(companyId), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(0L);

            PrescriptionsSummaryResponseDTO response = entitySummaryService.getPrescriptionsSummary(companyId);

            assertThat(response.totalCount()).isZero();
            assertThat(response.pendingCount()).isZero();
            assertThat(response.canceledCount()).isZero();
            assertThat(response.issuedThisMonthCount()).isZero();
        }
    }

    @Nested
    @DisplayName("getDeliveriesSummary")
    class GetDeliveriesSummary {

        @Test
        @DisplayName("should compose total, this-month, overdue and upcoming counts from existing repository queries")
        void shouldComposeDeliveriesSummary() {
            UUID companyId = UUID.randomUUID();

            when(deliveryRepository.countByCompany_Id(companyId)).thenReturn(120L);
            when(deliveryRepository.countByCompany_IdAndDeliveryDateBetween(
                    eq(companyId), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(9L);
            when(deliveryRepository.findActiveCycleDeliveriesByCompanyAndNextAvailableDateBefore(
                    eq(companyId), any(LocalDate.class)))
                    .thenReturn(List.of(buildDelivery(), buildDelivery()));
            when(deliveryRepository.findActiveCycleDeliveriesByCompanyAndNextAvailableDateBetween(
                    eq(companyId), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(List.of(buildDelivery()));

            DeliveriesSummaryResponseDTO response = entitySummaryService.getDeliveriesSummary(companyId);

            verify(companyAccessGuard).assertCanView(companyId);
            assertThat(response.totalCount()).isEqualTo(120L);
            assertThat(response.thisMonthCount()).isEqualTo(9L);
            assertThat(response.overdueCount()).isEqualTo(2L);
            assertThat(response.upcomingCount()).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("getMedicinesSummary")
    class GetMedicinesSummary {

        @Test
        @DisplayName("should compose total, new-this-month, without-EAN and movements-this-month counts")
        void shouldComposeMedicinesSummary() {
            UUID companyId = UUID.randomUUID();

            when(medicineRepository.countByCompany_Id(companyId)).thenReturn(80L);
            when(medicineRepository.countByCompany_IdAndCreatedAtBetween(eq(companyId), any(), any()))
                    .thenReturn(6L);
            when(medicineRepository.countByCompany_IdAndEanCodeIsNull(companyId)).thenReturn(14L);
            when(medicineMovementRepository.countByMedicine_Company_IdAndMovementDateBetween(
                    eq(companyId), any(LocalDate.class), any(LocalDate.class)))
                    .thenReturn(25L);

            MedicinesSummaryResponseDTO response = entitySummaryService.getMedicinesSummary(companyId);

            verify(companyAccessGuard).assertCanView(companyId);
            assertThat(response.totalCount()).isEqualTo(80L);
            assertThat(response.newThisMonthCount()).isEqualTo(6L);
            assertThat(response.withoutEanCodeCount()).isEqualTo(14L);
            assertThat(response.movementsThisMonthCount()).isEqualTo(25L);
        }
    }

    @Nested
    @DisplayName("getUsersSummary")
    class GetUsersSummary {

        @Test
        @DisplayName("should compose total, active, inactive and new-this-month counts")
        void shouldComposeUsersSummary() {
            UUID companyId = UUID.randomUUID();

            when(userRepository.countByCompanies_Id(companyId)).thenReturn(30L);
            when(userRepository.countByCompanies_IdAndActiveTrue(companyId)).thenReturn(27L);
            when(userRepository.countByCompanies_IdAndActiveFalse(companyId)).thenReturn(3L);
            when(userRepository.countByCompanies_IdAndCreatedAtBetween(eq(companyId), any(), any()))
                    .thenReturn(2L);

            UsersSummaryResponseDTO response = entitySummaryService.getUsersSummary(companyId);

            verify(companyAccessGuard).assertCanView(companyId);
            assertThat(response.totalCount()).isEqualTo(30L);
            assertThat(response.activeCount()).isEqualTo(27L);
            assertThat(response.inactiveCount()).isEqualTo(3L);
            assertThat(response.newThisMonthCount()).isEqualTo(2L);
        }
    }
}
