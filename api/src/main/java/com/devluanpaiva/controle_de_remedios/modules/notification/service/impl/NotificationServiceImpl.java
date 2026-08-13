package com.devluanpaiva.controle_de_remedios.modules.notification.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationCommand;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.RegisterDeviceTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.DevicePushToken;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.Notification;
import com.devluanpaiva.controle_de_remedios.modules.notification.mapper.NotificationMapper;
import com.devluanpaiva.controle_de_remedios.modules.notification.repository.DevicePushTokenRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.repository.NotificationRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationDispatcher;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationService;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final DevicePushTokenRepository devicePushTokenRepository;
    private final NotificationMapper notificationMapper;
    private final NotificationDispatcher notificationDispatcher;
    private final SecurityContextHelper securityContextHelper;

    @Override
    @Transactional
    public void notify(NotificationCommand command) {
        Notification notification = Notification.builder()
                .recipient(command.recipient())
                .type(command.type())
                .title(command.title())
                .body(command.body())
                .prescriptionItem(command.prescriptionItem())
                .delivery(command.delivery())
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        dispatchAfterCommit(savedNotification);
    }

    private void dispatchAfterCommit(Notification notification) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            notificationDispatcher.dispatch(notification);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                notificationDispatcher.dispatch(notification);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> listMyNotifications(Pageable pageable) {
        UUID recipientId = securityContextHelper.getCurrentUserId();

        return notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable)
                .map(notificationMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public long countMyUnreadNotifications() {
        return notificationRepository.countByRecipient_IdAndReadAtIsNull(securityContextHelper.getCurrentUserId());
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(UUID id) {
        UUID recipientId = securityContextHelper.getCurrentUserId();

        Notification notification = notificationRepository.findByIdAndRecipient_Id(id, recipientId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "Notificação não encontrada",
                        "NOTIFICATION_NOT_FOUND",
                        "id",
                        "Não foi possível encontrar uma notificação com o ID '" + id + "'."));

        if (!notification.isRead()) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return notificationMapper.toResponseDTO(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAsReadByRecipient(
                securityContextHelper.getCurrentUserId(), LocalDateTime.now());
    }

    @Override
    @Transactional
    public void registerDeviceToken(RegisterDeviceTokenRequestDTO dto) {
        User actor = securityContextHelper.getCurrentUser();

        DevicePushToken deviceToken = devicePushTokenRepository.findByToken(dto.token())
                .orElseGet(() -> DevicePushToken.builder().token(dto.token()).build());

        deviceToken.setUser(actor);
        deviceToken.setPlatform(dto.platform());

        devicePushTokenRepository.save(deviceToken);
    }

    @Override
    @Transactional
    public void removeDeviceToken(String token) {
        devicePushTokenRepository.deleteByTokenAndUser_Id(token, securityContextHelper.getCurrentUserId());
    }
}
