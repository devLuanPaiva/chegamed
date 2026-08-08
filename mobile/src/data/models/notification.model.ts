export enum NotificationType {
    DELIVERY_DISPATCHED = "DELIVERY_DISPATCHED",
    DELIVERY_ON_THE_WAY = "DELIVERY_ON_THE_WAY",
    DELIVERY_COMPLETED = "DELIVERY_COMPLETED",
    PRESCRIPTION_ITEM_CANCELED = "PRESCRIPTION_ITEM_CANCELED",
}

export enum DevicePlatform {
    ANDROID = "ANDROID",
    IOS = "IOS",
    WEB = "WEB",
}

export interface INotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    prescriptionItemId: string | null;
    deliveryId: string | null;
    read: boolean;
    readAt: Date | null;
    createdAt: Date;
}

export interface RegisterDeviceTokenRequest {
    token: string;
    platform: DevicePlatform;
}
