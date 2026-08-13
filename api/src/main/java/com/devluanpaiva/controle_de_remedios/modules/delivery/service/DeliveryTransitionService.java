package com.devluanpaiva.controle_de_remedios.modules.delivery.service;

import java.time.LocalDate;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;

public interface DeliveryTransitionService {
    PrescriptionItem markOutForDelivery(PrescriptionItem item);

    Delivery registerDelivery(PrescriptionItem item, User deliverer, LocalDate deliveryDate, int quantity);
}
