package com.devluanpaiva.controle_de_remedios.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AppleLoginRequestDTO(
        @NotBlank String identityToken,
        @Size(max = 120) String fullName) {

}
