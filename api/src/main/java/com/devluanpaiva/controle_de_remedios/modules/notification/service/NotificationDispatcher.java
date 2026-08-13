package com.devluanpaiva.controle_de_remedios.modules.notification.service;

import com.devluanpaiva.controle_de_remedios.modules.notification.entity.Notification;

public interface NotificationDispatcher {
    void dispatch(Notification notification);
}
