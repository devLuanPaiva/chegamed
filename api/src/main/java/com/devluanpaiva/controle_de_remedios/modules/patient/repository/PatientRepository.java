package com.devluanpaiva.controle_de_remedios.modules.patient.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, UUID>, JpaSpecificationExecutor<Patient> {
    boolean existsByCompanyIdAndCpf(UUID companyId, String cpf);

    boolean existsByUser_Id(UUID userId);

    Optional<Patient> findByCompany_IdAndCpf(UUID companyId, String cpf);

    long countByCompany_Id(UUID companyId);

    long countByCompany_IdAndCreatedAtBetween(UUID companyId, LocalDateTime from, LocalDateTime to);

    long countByCompany_IdAndUserIsNull(UUID companyId);
}
