package com.devluanpaiva.controle_de_remedios.modules.delivery.service;

import java.util.List;
import java.util.UUID;

import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.CreateDeliveryRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.DeliveryResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.PendingDeliveryItemResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.delivery.dto.ReserveStockRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.dto.PrescriptionItemResponseDTO;

public interface DeliveryService {
    DeliveryResponseDTO createDelivery(CreateDeliveryRequestDTO dto);

    List<DeliveryResponseDTO> deliverAllPendingItems(UUID prescriptionId);

    PendingDeliveryItemResponseDTO dispatchForDelivery(UUID prescriptionItemId);

    List<PendingDeliveryItemResponseDTO> dispatchAllPendingItems(UUID prescriptionId);

    PrescriptionItemResponseDTO reserveStock(UUID prescriptionItemId, ReserveStockRequestDTO dto);
}
