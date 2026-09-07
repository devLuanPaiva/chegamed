package com.devluanpaiva.controle_de_remedios.modules.medicine.service;

import java.util.Locale;

public final class MedicineNameNormalizer {
    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private MedicineNameNormalizer() {
    }

    public static String normalize(String name) {
        return name == null ? null : name.strip().toUpperCase(PT_BR);
    }
}
