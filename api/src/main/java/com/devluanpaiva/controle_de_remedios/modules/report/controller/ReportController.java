package com.devluanpaiva.controle_de_remedios.modules.report.controller;

import java.util.UUID;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devluanpaiva.controle_de_remedios.modules.report.dto.ReportDocument;
import com.devluanpaiva.controle_de_remedios.modules.report.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/patients/pdf")
    public ResponseEntity<byte[]> getPatientsReport(@RequestParam UUID companyId) {
        return toPdfResponse(reportService.generatePatientsReport(companyId));
    }

    @GetMapping("/prescription-items/pdf")
    public ResponseEntity<byte[]> getPrescriptionItemsReport(@RequestParam UUID companyId) {
        return toPdfResponse(reportService.generatePrescriptionItemsReport(companyId));
    }

    private ResponseEntity<byte[]> toPdfResponse(ReportDocument document) {
        ContentDisposition contentDisposition = ContentDisposition.attachment()
                .filename(document.filename())
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(contentDisposition);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(document.content());
    }
}
