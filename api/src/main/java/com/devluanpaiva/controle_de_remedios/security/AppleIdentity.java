package com.devluanpaiva.controle_de_remedios.security;

public record AppleIdentity(
        String subject,
        String email,
        boolean emailVerified) {

}
