package com.devluanpaiva.controle_de_remedios_test.unit.modules.prescription.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.devluanpaiva.controle_de_remedios.modules.prescription.entity.Prescription;
import com.devluanpaiva.controle_de_remedios.modules.prescription.enums.PrescriptionStatus;
import com.devluanpaiva.controle_de_remedios.modules.prescription.service.PrescriptionStatusResolver;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;

@DisplayName("PrescriptionStatusResolver")
class PrescriptionStatusResolverTest {

    private PrescriptionStatusResolver prescriptionStatusResolver;

    @BeforeEach
    void setUp() {
        prescriptionStatusResolver = new PrescriptionStatusResolver();
    }

    private Prescription buildPrescriptionWithItems(PrescriptionStatus... itemStatuses) {
        Prescription prescription = Prescription.builder().id(UUID.randomUUID()).build();

        Arrays.stream(itemStatuses)
                .map(status -> PrescriptionItem.builder().id(UUID.randomUUID()).status(status).build())
                .forEach(prescription.getItems()::add);

        return prescription;
    }

    @Test
    @DisplayName("should stay PENDING while every item waits in the pharmacy")
    void shouldStayPendingWhileEveryItemWaits() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.PENDING, PrescriptionStatus.PENDING);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.PENDING);
    }

    @Test
    @DisplayName("should become OUT_FOR_DELIVERY when at least one item was dispatched and none was delivered")
    void shouldBecomeOutForDeliveryWhenAnyItemWasDispatched() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.PENDING, PrescriptionStatus.OUT_FOR_DELIVERY);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.OUT_FOR_DELIVERY);
    }

    @Test
    @DisplayName("should become DELIVERED when every active item was delivered")
    void shouldBecomeDeliveredWhenEveryActiveItemWasDelivered() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.DELIVERED, PrescriptionStatus.DELIVERED);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.DELIVERED);
    }

    @Test
    @DisplayName("should ignore canceled items when deciding that everything was delivered")
    void shouldIgnoreCanceledItemsWhenEverythingElseWasDelivered() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.DELIVERED, PrescriptionStatus.CANCELED);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.DELIVERED);
    }

    @Test
    @DisplayName("should become PARTIAL_DELIVERED when one item was delivered and another still waits")
    void shouldBecomePartialDeliveredWhenSomeItemsStillWait() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.DELIVERED, PrescriptionStatus.PENDING);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
    }

    @Test
    @DisplayName("should become PARTIAL_DELIVERED when an item was delivered below the prescribed quantity")
    void shouldBecomePartialDeliveredWhenAnItemWasPartiallyDelivered() {
        Prescription prescription = buildPrescriptionWithItems(PrescriptionStatus.PARTIAL_DELIVERED);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
    }

    @Test
    @DisplayName("should prioritise PARTIAL_DELIVERED over OUT_FOR_DELIVERY")
    void shouldPrioritisePartialDeliveredOverOutForDelivery() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.DELIVERED, PrescriptionStatus.OUT_FOR_DELIVERY);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.PARTIAL_DELIVERED);
    }

    @Test
    @DisplayName("should become CANCELED when every item was canceled")
    void shouldBecomeCanceledWhenEveryItemWasCanceled() {
        Prescription prescription = buildPrescriptionWithItems(
                PrescriptionStatus.CANCELED, PrescriptionStatus.CANCELED);

        assertThat(prescriptionStatusResolver.resolve(prescription)).isEqualTo(PrescriptionStatus.CANCELED);
    }

    @Test
    @DisplayName("should become CANCELED when the prescription has no items")
    void shouldBecomeCanceledWhenPrescriptionHasNoItems() {
        assertThat(prescriptionStatusResolver.resolve(buildPrescriptionWithItems()))
                .isEqualTo(PrescriptionStatus.CANCELED);
    }
}
