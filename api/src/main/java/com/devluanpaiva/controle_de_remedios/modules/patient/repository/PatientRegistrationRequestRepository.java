package com.devluanpaiva.controle_de_remedios.modules.patient.repository;

import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.devluanpaiva.controle_de_remedios.modules.patient.entity.PatientRegistrationRequest;
import com.devluanpaiva.controle_de_remedios.modules.patient.enums.PatientRegistrationRequestStatus;

public interface PatientRegistrationRequestRepository extends JpaRepository<PatientRegistrationRequest, UUID> {
    boolean existsByCompanyIdAndCpfAndStatus(UUID companyId, String cpf, PatientRegistrationRequestStatus status);

    Page<PatientRegistrationRequest> findAllByStatus(PatientRegistrationRequestStatus status, Pageable pageable);

    Page<PatientRegistrationRequest> findAllByCompanyIdInAndStatus(
            Set<UUID> companyIds, PatientRegistrationRequestStatus status, Pageable pageable);
}
