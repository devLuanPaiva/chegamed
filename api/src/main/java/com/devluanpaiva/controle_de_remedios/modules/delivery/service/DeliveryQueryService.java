package com.devluanpaiva.controle_de_remedios.modules.delivery.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.EligiblePrescriptionResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingQueueItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.DeliveryFilter;
import com.devluanpaiva.controle_de_remedios.modules.delivery.filter.PendingDeliveryItemFilter;

public interface DeliveryQueryService {
    DeliveryResponseDTO getDeliveryById(UUID id);

    Page<DeliveryResponseDTO> listDeliveries(DeliveryFilter filter, Pageable pageable);

    Page<DeliveryResponseDTO> listDeliveriesOfCurrentPatient(Pageable pageable);

    Page<PendingDeliveryItemResponseDTO> listPendingDeliveryItems(PendingDeliveryItemFilter filter, Pageable pageable);

    Page<PendingDeliveryItemResponseDTO> listPendingItemsOfCurrentPatient(Pageable pageable);

    Page<PendingDeliveryItemResponseDTO> listOutForDeliveryItemsOfCurrentDeliverer(Pageable pageable);

    Page<DeliveryResponseDTO> listDeliveriesCompletedByCurrentDeliverer(Pageable pageable);

    List<PendingQueueItemResponseDTO> getPendingQueue(UUID medicineId);

    List<EligiblePrescriptionResponseDTO> getEligiblePrescriptions(UUID companyId, String cpf);
}
