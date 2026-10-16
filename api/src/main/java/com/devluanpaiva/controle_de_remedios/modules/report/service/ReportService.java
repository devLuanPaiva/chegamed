package com.devluanpaiva.controle_de_remedios.modules.report.service;

import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.report.dto.ReportDocument;

public interface ReportService {
    ReportDocument generatePatientsReport(UUID companyId);

    ReportDocument generatePrescriptionItemsReport(UUID companyId);
}
