import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { DevicePlatform } from "@/data/models/notification.model";

const ANDROID_CHANNEL_ID = "deliveries";
const ANDROID_CHANNEL_NAME = "Entregas";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

function resolveDevicePlatform(): DevicePlatform {
    if (Platform.OS === "ios") {
        return DevicePlatform.IOS;
    }

    if (Platform.OS === "android") {
        return DevicePlatform.ANDROID;
    }

    return DevicePlatform.WEB;
}

function resolveProjectId(): string | undefined {
    return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

async function ensureAndroidChannel(): Promise<void> {
    if (Platform.OS !== "android") {
        return;
    }

    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: ANDROID_CHANNEL_NAME,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
    });
}

export interface DevicePushRegistration {
    token: string;
    platform: DevicePlatform;
}

export async function requestDevicePushRegistration(): Promise<DevicePushRegistration | null> {
    if (!Device.isDevice) {
        return null;
    }

    await ensureAndroidChannel();

    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    const status =
        currentStatus === "granted" ? currentStatus : (await Notifications.requestPermissionsAsync()).status;

    if (status !== "granted") {
        return null;
    }

    const projectId = resolveProjectId();

    if (!projectId) {
        return null;
    }

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });

    return { token: data, platform: resolveDevicePlatform() };
}

export async function setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
}

export function addPushReceivedListener(onReceived: () => void): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(() => onReceived());
}

export function addPushOpenedListener(onOpened: () => void): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(() => onOpened());
}
