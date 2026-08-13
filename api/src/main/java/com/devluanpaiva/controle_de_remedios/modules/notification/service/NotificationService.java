package com.devluanpaiva.controle_de_remedios.modules.notification.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationCommand;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.RegisterDeviceTokenRequestDTO;

public interface NotificationService {
    void notify(NotificationCommand command);

    Page<NotificationResponseDTO> listMyNotifications(Pageable pageable);

    long countMyUnreadNotifications();

    NotificationResponseDTO markAsRead(UUID id);

    void markAllAsRead();

    void registerDeviceToken(RegisterDeviceTokenRequestDTO dto);

    void removeDeviceToken(String token);
}
