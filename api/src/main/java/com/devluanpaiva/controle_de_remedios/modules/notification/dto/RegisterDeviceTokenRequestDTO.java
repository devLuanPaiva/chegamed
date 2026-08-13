package com.devluanpaiva.controle_de_remedios.modules.notification.dto;

import com.devluanpaiva.controle_de_remedios.modules.notification.enums.DevicePlatform;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterDeviceTokenRequestDTO(
        @NotBlank @Size(max = 255) String token,
        @NotNull DevicePlatform platform) {
}
