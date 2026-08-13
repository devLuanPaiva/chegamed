package com.devluanpaiva.controle_de_remedios.modules.notification.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.devluanpaiva.controle_de_remedios.modules.notification.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByRecipient_IdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    Optional<Notification> findByIdAndRecipient_Id(UUID id, UUID recipientId);

    long countByRecipient_IdAndReadAtIsNull(UUID recipientId);

    @Modifying
    @Query("update Notification n set n.readAt = :readAt "
            + "where n.recipient.id = :recipientId and n.readAt is null")
    int markAllAsReadByRecipient(@Param("recipientId") UUID recipientId, @Param("readAt") LocalDateTime readAt);
}
