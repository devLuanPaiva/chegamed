package com.devluanpaiva.controle_de_remedios.modules.notification.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devluanpaiva.controle_de_remedios.modules.notification.entity.DevicePushToken;

public interface DevicePushTokenRepository extends JpaRepository<DevicePushToken, UUID> {
    Optional<DevicePushToken> findByToken(String token);

    List<DevicePushToken> findByUser_Id(UUID userId);

    void deleteByTokenAndUser_Id(String token, UUID userId);
}
