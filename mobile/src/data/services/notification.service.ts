import { apiFetch } from "@/lib/apiFetch";
import { PagedResult } from "@/lib/pagination";
import {
    INotification,
    NotificationType,
    RegisterDeviceTokenRequest,
} from "@/data/models/notification.model";

const PAGE_SIZE = 20;

interface NotificationDto {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    prescriptionItemId: string | null;
    deliveryId: string | null;
    read: boolean;
    readAt: string | null;
    createdAt: string;
}

interface UnreadCountDto {
    unreadCount: number;
}

function toNotification(dto: NotificationDto): INotification {
    return {
        id: dto.id,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        prescriptionItemId: dto.prescriptionItemId,
        deliveryId: dto.deliveryId,
        read: dto.read,
        readAt: dto.readAt ? new Date(dto.readAt) : null,
        createdAt: new Date(dto.createdAt),
    };
}

export async function getNotifications(page: number): Promise<PagedResult<INotification>> {
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    const response = await apiFetch<NotificationDto[]>(`/notifications?${params.toString()}`);

    return {
        data: response.data.map(toNotification),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getUnreadNotificationCount(): Promise<number> {
    const response = await apiFetch<UnreadCountDto>("/notifications/unread-count");
    return response.data.unreadCount;
}

export async function markNotificationAsRead(id: string): Promise<INotification> {
    const response = await apiFetch<NotificationDto>(`/notifications/${id}/read`, { method: "PATCH" });
    return toNotification(response.data);
}

export async function markAllNotificationsAsRead(): Promise<void> {
    await apiFetch<null>("/notifications/read-all", { method: "PATCH" });
}

export async function registerDeviceToken(payload: RegisterDeviceTokenRequest): Promise<void> {
    await apiFetch<null>("/notifications/device-tokens", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function removeDeviceToken(token: string): Promise<void> {
    await apiFetch<null>(`/notifications/device-tokens/${encodeURIComponent(token)}`, { method: "DELETE" });
}
