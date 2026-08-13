package com.devluanpaiva.controle_de_remedios.modules.notification.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.devluanpaiva.controle_de_remedios.modules.notification.dto.NotificationResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.RegisterDeviceTokenRequestDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.dto.UnreadNotificationCountResponseDTO;
import com.devluanpaiva.controle_de_remedios.modules.notification.service.NotificationService;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponse;
import com.devluanpaiva.controle_de_remedios.shared.responses.ApiResponseFactory;
import com.devluanpaiva.controle_de_remedios.shared.utils.PageableFactory;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lista as notificações do usuário autenticado")
    public ApiResponse<List<NotificationResponseDTO>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageableFactory.build(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<NotificationResponseDTO> result = notificationService.listMyNotifications(pageable);

        String next = result.hasNext() ? buildPageUri(page + 1, size) : null;
        String previous = result.hasPrevious() ? buildPageUri(page - 1, size) : null;

        return ApiResponseFactory.paginated("Lista de notificações obtida com sucesso", result, next, previous);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Retorna a quantidade de notificações não lidas do usuário autenticado")
    public ApiResponse<UnreadNotificationCountResponseDTO> getUnreadCount() {
        return ApiResponseFactory.success(
                "Quantidade de notificações não lidas obtida com sucesso",
                new UnreadNotificationCountResponseDTO(notificationService.countMyUnreadNotifications()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marca uma notificação como lida")
    public ApiResponse<NotificationResponseDTO> markAsRead(@PathVariable UUID id) {
        return ApiResponseFactory.success("Notificação marcada como lida", notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marca todas as notificações do usuário autenticado como lidas")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponseFactory.success("Notificações marcadas como lidas", null);
    }

    @PostMapping("/device-tokens")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra o token de push do dispositivo do usuário autenticado")
    public ApiResponse<Void> registerDeviceToken(@RequestBody @Valid RegisterDeviceTokenRequestDTO dto) {
        notificationService.registerDeviceToken(dto);
        return ApiResponseFactory.success("Dispositivo registrado para notificações", null);
    }

    @DeleteMapping("/device-tokens/{token}")
    @Operation(summary = "Remove o token de push de um dispositivo")
    public ApiResponse<Void> removeDeviceToken(@PathVariable String token) {
        notificationService.removeDeviceToken(token);
        return ApiResponseFactory.success("Dispositivo removido das notificações", null);
    }

    private String buildPageUri(int page, int size) {
        return ServletUriComponentsBuilder.fromCurrentRequestUri()
                .replaceQueryParam("page", page)
                .replaceQueryParam("size", size)
                .toUriString();
    }
}
