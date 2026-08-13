package com.devluanpaiva.controle_de_remedios_test.unit.modules.notification.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationCommand;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.RegisterDeviceTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.DevicePushToken;
import com.devluanpaiva.controle_de_remedios.modules.notification.entity.Notification;
import com.devluanpaiva.controle_de_remedios.modules.notification.enums.DevicePlatform;
import com.devluanpaiva.controle_de_remedios.modules.notification.enums.NotificationType;
import com.devluanpaiva.controle_de_remedios.modules.notification.mapper.NotificationMapper;
import com.devluanpaiva.controle_de_remedios.modules.notification.repository.DevicePushTokenRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.repository.NotificationRepository;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationDispatcher;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.impl.NotificationServiceImpl;
import com.devluanpaiva.controle_de_remedios.modules.user.entity.User;
import com.devluanpaiva.controle_de_remedios.modules.user.enums.UserRole;
import com.devluanpaiva.controle_de_remedios.security.SecurityContextHelper;
import com.devluanpaiva.controle_de_remedios.shared.exceptions.BusinessException;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationServiceImpl")
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private DevicePushTokenRepository devicePushTokenRepository;

    @Mock
    private NotificationDispatcher notificationDispatcher;

    @Mock
    private SecurityContextHelper securityContextHelper;

    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationServiceImpl(
                notificationRepository, devicePushTokenRepository, new NotificationMapper(),
                notificationDispatcher, securityContextHelper);
    }

    private User buildUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("Maria")
                .email("maria@example.com")
                .password("encoded-password")
                .cpf("11144477735")
                .role(UserRole.PATIENT)
                .active(true)
                .build();
    }

    private Notification buildNotification(User recipient) {
        return Notification.builder()
                .id(UUID.randomUUID())
                .recipient(recipient)
                .type(NotificationType.DELIVERY_ON_THE_WAY)
                .title("Sua entrega está a caminho")
                .body("Dipirona saiu para entrega.")
                .build();
    }

    @Nested
    @DisplayName("notify")
    class Notify {

        @Test
        @DisplayName("should persist the notification and hand it to the dispatcher")
        void shouldPersistAndDispatch() {
            User recipient = buildUser();

            when(notificationRepository.save(any(Notification.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            notificationService.notify(NotificationCommand.builder()
                    .recipient(recipient)
                    .type(NotificationType.DELIVERY_DISPATCHED)
                    .title("Novo remédio para entregar")
                    .body("Dipirona para Maria.")
                    .build());

            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());
            verify(notificationDispatcher).dispatch(notificationCaptor.getValue());

            Notification persisted = notificationCaptor.getValue();
            assertThat(persisted.getRecipient()).isEqualTo(recipient);
            assertThat(persisted.getType()).isEqualTo(NotificationType.DELIVERY_DISPATCHED);
            assertThat(persisted.isRead()).isFalse();
        }
    }

    @Nested
    @DisplayName("markAsRead")
    class MarkAsRead {

        @Test
        @DisplayName("should only reach notifications that belong to the current user")
        void shouldScopeLookupToCurrentUser() {
            User recipient = buildUser();
            Notification notification = buildNotification(recipient);

            when(securityContextHelper.getCurrentUserId()).thenReturn(recipient.getId());
            when(notificationRepository.findByIdAndRecipient_Id(notification.getId(), recipient.getId()))
                    .thenReturn(Optional.of(notification));
            when(notificationRepository.save(notification)).thenReturn(notification);

            NotificationResponseDTO response = notificationService.markAsRead(notification.getId());

            assertThat(response.read()).isTrue();
            assertThat(notification.getReadAt()).isNotNull();
        }

        @Test
        @DisplayName("should throw 404 when the notification belongs to another user")
        void shouldThrowWhenNotificationBelongsToAnotherUser() {
            UUID currentUserId = UUID.randomUUID();
            UUID notificationId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUserId()).thenReturn(currentUserId);
            when(notificationRepository.findByIdAndRecipient_Id(notificationId, currentUserId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> notificationService.markAsRead(notificationId))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                        assertThat(businessException.getCode()).isEqualTo("NOTIFICATION_NOT_FOUND");
                    });
        }

        @Test
        @DisplayName("should keep the original readAt when the notification was already read")
        void shouldKeepOriginalReadAtWhenAlreadyRead() {
            User recipient = buildUser();
            Notification notification = buildNotification(recipient);
            LocalDateTime originalReadAt = LocalDateTime.of(2026, 1, 1, 8, 0);
            notification.setReadAt(originalReadAt);

            when(securityContextHelper.getCurrentUserId()).thenReturn(recipient.getId());
            when(notificationRepository.findByIdAndRecipient_Id(notification.getId(), recipient.getId()))
                    .thenReturn(Optional.of(notification));

            notificationService.markAsRead(notification.getId());

            assertThat(notification.getReadAt()).isEqualTo(originalReadAt);
            verify(notificationRepository, never()).save(any(Notification.class));
        }
    }

    @Nested
    @DisplayName("listMyNotifications")
    class ListMyNotifications {

        @Test
        @DisplayName("should query only the notifications of the current user")
        void shouldQueryOnlyCurrentUserNotifications() {
            UUID currentUserId = UUID.randomUUID();
            PageRequest pageable = PageRequest.of(0, 20);

            when(securityContextHelper.getCurrentUserId()).thenReturn(currentUserId);
            when(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(currentUserId, pageable))
                    .thenReturn(org.springframework.data.domain.Page.empty(pageable));

            notificationService.listMyNotifications(pageable);

            verify(notificationRepository).findByRecipient_IdOrderByCreatedAtDesc(currentUserId, pageable);
        }
    }

    @Nested
    @DisplayName("device tokens")
    class DeviceTokens {

        @Test
        @DisplayName("should reassign an existing token to the current user so it stops feeding the previous account")
        void shouldReassignExistingTokenToCurrentUser() {
            User previousOwner = buildUser();
            User currentOwner = buildUser();
            DevicePushToken existingToken = DevicePushToken.builder()
                    .id(UUID.randomUUID())
                    .user(previousOwner)
                    .token("ExponentPushToken[abc]")
                    .platform(DevicePlatform.IOS)
                    .build();

            when(securityContextHelper.getCurrentUser()).thenReturn(currentOwner);
            when(devicePushTokenRepository.findByToken("ExponentPushToken[abc]"))
                    .thenReturn(Optional.of(existingToken));

            notificationService.registerDeviceToken(
                    new RegisterDeviceTokenRequestDTO("ExponentPushToken[abc]", DevicePlatform.ANDROID));

            assertThat(existingToken.getUser()).isEqualTo(currentOwner);
            assertThat(existingToken.getPlatform()).isEqualTo(DevicePlatform.ANDROID);
            verify(devicePushTokenRepository).save(existingToken);
        }

        @Test
        @DisplayName("should only delete a device token owned by the current user")
        void shouldOnlyDeleteTokenOwnedByCurrentUser() {
            UUID currentUserId = UUID.randomUUID();

            when(securityContextHelper.getCurrentUserId()).thenReturn(currentUserId);

            notificationService.removeDeviceToken("ExponentPushToken[abc]");

            verify(devicePushTokenRepository).deleteByTokenAndUser_Id("ExponentPushToken[abc]", currentUserId);
        }
    }
}
