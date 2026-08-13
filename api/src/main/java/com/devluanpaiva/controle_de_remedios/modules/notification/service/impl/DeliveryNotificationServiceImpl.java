package com.devluanpaiva.controle_de_remedios.modules.notification.service.impl;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.devluanpaiva.controle_de_remedios.modules.delivery.entity.Delivery;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationCommand;
import com.devluanpaiva.controle_de_remedios.modules.notification.enums.NotificationType;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.DeliveryNotificationService;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationService;
import com.devluanpaiva.controle_de_remedios.modules.patient.entity.Patient;
import com.devluanpaiva.controle_de_remedios.modules.prescription_item.entity.PrescriptionItem;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryNotificationServiceImpl implements DeliveryNotificationService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int MAX_BODY_LENGTH = 400;
    private static final String ADDRESS_FALLBACK = "endereço não informado";

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public void notifyDispatched(PrescriptionItem item) {
        Patient patient = item.getPrescription().getPatient();
        String medicineName = item.getMedicine().getName();

        notifyDeliverers(item, patient, medicineName);
        notifyPatientDispatched(item, patient, medicineName);
    }

    private void notifyDeliverers(PrescriptionItem item, Patient patient, String medicineName) {
        List<User> deliverers = userRepository.findByRoleAndActiveTrueAndCompanies_Id(
                UserRole.DELIVERER, patient.getCompany().getId());

        String body = "%s para %s. Endereço: %s.".formatted(medicineName, patient.getName(), resolveAddress(patient));

        deliverers.forEach(deliverer -> notificationService.notify(NotificationCommand.builder()
                .recipient(deliverer)
                .type(NotificationType.DELIVERY_DISPATCHED)
                .title("Novo remédio para entregar")
                .body(truncate(body))
                .prescriptionItem(item)
                .build()));
    }

    private void notifyPatientDispatched(PrescriptionItem item, Patient patient, String medicineName) {
        User patientUser = patient.getUser();

        if (patientUser == null) {
            return;
        }

        notificationService.notify(NotificationCommand.builder()
                .recipient(patientUser)
                .type(NotificationType.DELIVERY_ON_THE_WAY)
                .title("Sua entrega está a caminho")
                .body(truncate("%s saiu para entrega e chegará no endereço cadastrado.".formatted(medicineName)))
                .prescriptionItem(item)
                .build());
    }

    @Override
    public void notifyDelivered(Delivery delivery) {
        User patientUser = delivery.getPatient().getUser();

        if (patientUser == null) {
            return;
        }

        String medicineName = delivery.getPrescriptionItem().getMedicine().getName();
        String body = delivery.getNextAvailableDate() != null
                ? "%s foi entregue. A próxima retirada estará disponível em %s.".formatted(
                        medicineName, DATE_FORMATTER.format(delivery.getNextAvailableDate()))
                : "%s foi entregue.".formatted(medicineName);

        notificationService.notify(NotificationCommand.builder()
                .recipient(patientUser)
                .type(NotificationType.DELIVERY_COMPLETED)
                .title("Entrega concluída")
                .body(truncate(body))
                .prescriptionItem(delivery.getPrescriptionItem())
                .delivery(delivery)
                .build());
    }

    @Override
    public void notifyCanceled(PrescriptionItem item) {
        User patientUser = item.getPrescription().getPatient().getUser();

        if (patientUser == null) {
            return;
        }

        notificationService.notify(NotificationCommand.builder()
                .recipient(patientUser)
                .type(NotificationType.PRESCRIPTION_ITEM_CANCELED)
                .title("Item da receita cancelado")
                .body(truncate("%s foi cancelado pela farmácia. Procure a unidade para mais informações."
                        .formatted(item.getMedicine().getName())))
                .prescriptionItem(item)
                .build());
    }

    private String resolveAddress(Patient patient) {
        return StringUtils.hasText(patient.getAddress()) ? patient.getAddress() : ADDRESS_FALLBACK;
    }

    private String truncate(String body) {
        return body.length() <= MAX_BODY_LENGTH ? body : body.substring(0, MAX_BODY_LENGTH - 3) + "...";
    }
}
