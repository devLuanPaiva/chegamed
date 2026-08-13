package com.devluanpaiva.controle_de_remedios.modules.prescription.enums;

import java.util.List;

public enum PrescriptionStatus {
    PENDING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    PARTIAL_DELIVERED,
    CANCELED;

    private static final List<PrescriptionStatus> DISPATCHABLE = List.of(PENDING);
    private static final List<PrescriptionStatus> DELIVERABLE = List.of(PENDING, OUT_FOR_DELIVERY);
    private static final List<PrescriptionStatus> CANCELABLE = List.of(PENDING, OUT_FOR_DELIVERY);
    private static final List<PrescriptionStatus> FULFILLED = List.of(DELIVERED, PARTIAL_DELIVERED);

    public static List<PrescriptionStatus> dispatchable() {
        return DISPATCHABLE;
    }

    public static List<PrescriptionStatus> deliverable() {
        return DELIVERABLE;
    }

    public static List<PrescriptionStatus> cancelable() {
        return CANCELABLE;
    }

    public static List<PrescriptionStatus> fulfilled() {
        return FULFILLED;
    }
}
