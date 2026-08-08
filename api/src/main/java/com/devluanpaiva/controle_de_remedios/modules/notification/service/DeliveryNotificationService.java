package com.devluanpaiva.controle_de_remedios.modules.notification.service;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

public interface DeliveryNotificationService {
    void notifyDispatched(PrescriptionItem item);

    void notifyDelivered(Delivery delivery);

    void notifyCanceled(PrescriptionItem item);
}
