package com.devluanpaiva.controle_de_remedios.modules.dashboard.service;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.DeliveriesSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.MedicinesSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PatientsSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.PrescriptionsSummaryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.dashboard.dto.UsersSummaryResponseDTO;

public interface EntitySummaryService {
    PatientsSummaryResponseDTO getPatientsSummary(UUID companyId);

    PrescriptionsSummaryResponseDTO getPrescriptionsSummary(UUID companyId);

    DeliveriesSummaryResponseDTO getDeliveriesSummary(UUID companyId);

    MedicinesSummaryResponseDTO getMedicinesSummary(UUID companyId);

    UsersSummaryResponseDTO getUsersSummary(UUID companyId);
}
