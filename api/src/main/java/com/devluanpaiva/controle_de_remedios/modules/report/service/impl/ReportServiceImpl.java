package com.devluanpaiva.controle_de_remedios.modules.report.service.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devluanpaiva.controle_de_remedios.modules.company.entity.Company;
import com.devluanpaiva.controle_de_remedios.modules.company.repository.CompanyRepository;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.patient.filter.PatientSpecification;
import com.devluanpaiva.controle_de_remedios.modules.patient.repository.PatientRepository;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.enums.UnityType;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.repository.PrescriptionItemRepository;
import com.devluanpaiva.controle_de_remedios.modules.report.dto.ReportDocument;
import com.devluanpaiva.controle_de_remedios.modules.report.pdf.ReportPdfBuilder;
import com.devluanpaiva.controle_de_remedios.modules.report.service.ReportService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.AuthorizationPolicy;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FILENAME_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String NOT_DELIVERED_LABEL = "Não entregue";

    private static final Map<PrescriptionStatus, String> STATUS_LABELS = new EnumMap<>(PrescriptionStatus.class);
    private static final Map<UnityType, String> UNITY_LABELS = new EnumMap<>(UnityType.class);

    static {
        STATUS_LABELS.put(PrescriptionStatus.PENDING, "Pendente");
        STATUS_LABELS.put(PrescriptionStatus.OUT_FOR_DELIVERY, "Em entrega");
        STATUS_LABELS.put(PrescriptionStatus.DELIVERED, "Entregue");
        STATUS_LABELS.put(PrescriptionStatus.PARTIAL_DELIVERED, "Entrega parcial");
        STATUS_LABELS.put(PrescriptionStatus.CANCELED, "Cancelada");

        UNITY_LABELS.put(UnityType.TABLET, "Comprimido(s)");
        UNITY_LABELS.put(UnityType.CREAM, "Creme(s)");
        UNITY_LABELS.put(UnityType.LIQUID, "Líquido(s)");
    }

    private final PatientRepository patientRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final CompanyRepository companyRepository;
    private final ReportPdfBuilder reportPdfBuilder;
    private final SecurityContextHelper securityContextHelper;
    private final AuthorizationPolicy authorizationPolicy;

    @Override
    @Transactional(readOnly = true)
    public ReportDocument generatePatientsReport(UUID companyId) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(companyId);
        assertCanGenerateReport(actor, companyId);

        List<Patient> patients = patientRepository.findAll(
                PatientSpecification.hasCompanyId(companyId).and(PatientSpecification.orderByNameIgnoringAccents()));

        List<String[]> rows = new ArrayList<>();
        for (Patient patient : patients) {
            rows.add(new String[] {
                    patient.getName(),
                    formatCpf(patient.getCpf()),
                    patient.getBirthdate().toLocalDate().format(DATE_FORMAT),
            });
        }

        byte[] content = reportPdfBuilder.build(
                "Relatório de Pacientes",
                company.getName(),
                company.getCnpj(),
                actor.getName(),
                LocalDateTime.now(),
                new String[] { "Nome", "CPF", "Data de Nascimento" },
                new float[] { 3f, 2f, 2f },
                rows);

        return new ReportDocument(buildFilename("pacientes", company), content);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportDocument generatePrescriptionItemsReport(UUID companyId) {
        User actor = securityContextHelper.getCurrentUser();
        Company company = findCompanyOrThrow(companyId);
        assertCanGenerateReport(actor, companyId);

        List<PrescriptionItem> items = prescriptionItemRepository.findAllByCompanyForReport(companyId);

        List<String[]> rows = new ArrayList<>();
        for (PrescriptionItem item : items) {
            rows.add(new String[] {
                    item.getPrescription().getPatient().getName(),
                    item.getMedicine().getName(),
                    STATUS_LABELS.get(item.getStatus()),
                    item.getPrescribedQuantity() + " " + UNITY_LABELS.get(item.getUnityType()),
                    item.getCreatedAt().format(DATE_FORMAT),
                    formatDeliveryDate(item),
            });
        }

        byte[] content = reportPdfBuilder.build(
                "Relatório de Receituários",
                company.getName(),
                company.getCnpj(),
                actor.getName(),
                LocalDateTime.now(),
                new String[] { "Paciente", "Medicamento", "Situação", "Quantidade", "Data de Cadastro", "Data de Entrega" },
                new float[] { 2.4f, 2.4f, 1.5f, 1.5f, 1.4f, 1.4f },
                rows);

        return new ReportDocument(buildFilename("receituarios", company), content);
    }

    private String formatDeliveryDate(PrescriptionItem item) {
        if (item.getDelivery() == null || item.getDelivery().getDeliveryDate() == null) {
            return NOT_DELIVERED_LABEL;
        }

        return item.getDelivery().getDeliveryDate().format(DATE_FORMAT);
    }

    private String formatCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return cpf;
        }

        return cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9, 11);
    }

    private String buildFilename(String prefix, Company company) {
        return prefix + "-" + company.getSlug() + "-" + LocalDateTime.now().format(FILENAME_DATE_FORMAT) + ".pdf";
    }

    private void assertCanGenerateReport(User actor, UUID companyId) {
        authorizationPolicy.requireAdminOrRolesWithCondition(
                actor, Set.of(UserRole.MANAGER, UserRole.ASSISTANT),
                () -> companyRepository.existsByIdAndUsers_Id(companyId, actor.getId()));
    }

    private Company findCompanyOrThrow(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Empresa não encontrada",
                        "COMPANY_NOT_FOUND",
                        "companyId",
                        "Não foi possível encontrar uma empresa com o ID '" + id + "'."));
    }
}
