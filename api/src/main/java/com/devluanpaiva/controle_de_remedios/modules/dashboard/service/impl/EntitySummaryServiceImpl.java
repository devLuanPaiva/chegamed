package com.devluanpaiva.controle_de_remedios.modules.dashboard.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveriesSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.MedicinesSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PatientsSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionsSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.UsersSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.CompanyAccessGuard;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.service.EntitySummaryService;
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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EntitySummaryServiceImpl implements EntitySummaryService {
    private static final int UPCOMING_AVAILABILITY_DAYS = 7;

    private final PatientRepository patientRepository;
    private final PatientRegistrationRequestRepository patientRegistrationRequestRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DeliveryRepository deliveryRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineMovementRepository medicineMovementRepository;
    private final UserRepository userRepository;
    private final CompanyAccessGuard companyAccessGuard;

    @Override
    @Transactional(readOnly = true)
    public PatientsSummaryResponseDTO getPatientsSummary(UUID companyId) {
        companyAccessGuard.assertCanView(companyId);

        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        long totalCount = patientRepository.countByCompany_Id(companyId);
        long newThisMonthCount = patientRepository.countByCompany_IdAndCreatedAtBetween(companyId, monthStart, now);
        long withoutAccountCount = patientRepository.countByCompany_IdAndUserIsNull(companyId);
        long pendingRegistrationRequestsCount = patientRegistrationRequestRepository
                .countByCompanyIdAndStatus(companyId, PatientRegistrationRequestStatus.PENDING);

        return new PatientsSummaryResponseDTO(
                totalCount, newThisMonthCount, withoutAccountCount, pendingRegistrationRequestsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionsSummaryResponseDTO getPrescriptionsSummary(UUID companyId) {
        companyAccessGuard.assertCanView(companyId);

        long totalCount = 0;
        long pendingCount = 0;
        long canceledCount = 0;

        for (PrescriptionStatusCount count : prescriptionRepository.countByCompanyGroupedByStatus(companyId)) {
            totalCount += count.getCount();

            if (PrescriptionStatus.deliverable().contains(count.getStatus())) {
                pendingCount += count.getCount();
            } else if (count.getStatus() == PrescriptionStatus.CANCELED) {
                canceledCount += count.getCount();
            }
        }

        LocalDate today = LocalDate.now();
        long issuedThisMonthCount = prescriptionRepository
                .countByPatient_Company_IdAndIssueDateBetween(companyId, today.withDayOfMonth(1), today);

        return new PrescriptionsSummaryResponseDTO(totalCount, pendingCount, canceledCount, issuedThisMonthCount);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveriesSummaryResponseDTO getDeliveriesSummary(UUID companyId) {
        companyAccessGuard.assertCanView(companyId);

        LocalDate today = LocalDate.now();

        long totalCount = deliveryRepository.countByCompany_Id(companyId);
        long thisMonthCount = deliveryRepository
                .countByCompany_IdAndDeliveryDateBetween(companyId, today.withDayOfMonth(1), today);
        long overdueCount = deliveryRepository
                .findActiveCycleDeliveriesByCompanyAndNextAvailableDateBefore(companyId, today)
                .size();
        long upcomingCount = deliveryRepository
                .findActiveCycleDeliveriesByCompanyAndNextAvailableDateBetween(
                        companyId, today, today.plusDays(UPCOMING_AVAILABILITY_DAYS))
                .size();

        return new DeliveriesSummaryResponseDTO(totalCount, thisMonthCount, overdueCount, upcomingCount);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicinesSummaryResponseDTO getMedicinesSummary(UUID companyId) {
        companyAccessGuard.assertCanView(companyId);

        LocalDate today = LocalDate.now();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        long totalCount = medicineRepository.countByCompany_Id(companyId);
        long newThisMonthCount = medicineRepository.countByCompany_IdAndCreatedAtBetween(companyId, monthStart, now);
        long withoutEanCodeCount = medicineRepository.countByCompany_IdAndEanCodeIsNull(companyId);
        long movementsThisMonthCount = medicineMovementRepository
                .countByMedicine_Company_IdAndMovementDateBetween(companyId, today.withDayOfMonth(1), today);

        return new MedicinesSummaryResponseDTO(
                totalCount, newThisMonthCount, withoutEanCodeCount, movementsThisMonthCount);
    }

    @Override
    @Transactional(readOnly = true)
    public UsersSummaryResponseDTO getUsersSummary(UUID companyId) {
        companyAccessGuard.assertCanView(companyId);

        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        long totalCount = userRepository.countByCompanies_Id(companyId);
        long activeCount = userRepository.countByCompanies_IdAndActiveTrue(companyId);
        long inactiveCount = userRepository.countByCompanies_IdAndActiveFalse(companyId);
        long newThisMonthCount = userRepository.countByCompanies_IdAndCreatedAtBetween(companyId, monthStart, now);

        return new UsersSummaryResponseDTO(totalCount, activeCount, inactiveCount, newThisMonthCount);
    }
}
