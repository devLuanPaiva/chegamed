import { getAccessToken } from "@/lib/authStorage";
import { BASE_URL } from "@/lib/env";

const NOTIFICATIONS_PATH = "/ws/notifications";
const PING_INTERVAL_MS = 25_000;
const RECONNECT_BASE_DELAY_MS = 2_000;
const RECONNECT_MAX_DELAY_MS = 30_000;
const PING_MESSAGE = "ping";
const NOTIFICATION_CREATED_EVENT = "NOTIFICATION_CREATED";

export interface NotificationSocketPayload {
    id: string;
    type: string;
    title: string;
    body: string;
    prescriptionItemId: string | null;
    deliveryId: string | null;
    read: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface NotificationSocketEvent {
    notification: NotificationSocketPayload;
    unreadCount: number;
}

interface NotificationSocketOptions {
    onNotification: (event: NotificationSocketEvent) => void;
}

type WebSocketWithHeaders = new (
    url: string,
    protocols: string | string[] | undefined,
    options: { headers: Record<string, string> },
) => WebSocket;

function buildSocketUrl(): string {
    return `${BASE_URL.replace(/^http/, "ws")}${NOTIFICATIONS_PATH}`;
}

function openAuthenticatedSocket(accessToken: string): WebSocket {
    const WebSocketConstructor = WebSocket as unknown as WebSocketWithHeaders;

    return new WebSocketConstructor(buildSocketUrl(), undefined, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

function parseEvent(raw: string): NotificationSocketEvent | null {
    try {
        const parsed = JSON.parse(raw) as {
            event?: string;
            notification?: NotificationSocketPayload;
            unreadCount?: number;
        };

        if (parsed.event !== NOTIFICATION_CREATED_EVENT || !parsed.notification) {
            return null;
        }

        return { notification: parsed.notification, unreadCount: parsed.unreadCount ?? 0 };
    } catch {
        return null;
    }
}

export function connectNotificationSocket({ onNotification }: NotificationSocketOptions): () => void {
    let socket: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;
    let isDisposed = false;

    function clearTimers() {
        if (pingTimer) {
            clearInterval(pingTimer);
            pingTimer = null;
        }

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
    }

    function scheduleReconnect() {
        if (isDisposed || reconnectTimer) {
            return;
        }

        const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempts, RECONNECT_MAX_DELAY_MS);
        reconnectAttempts += 1;

        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            void connect();
        }, delay);
    }

    async function connect() {
        if (isDisposed) {
            return;
        }

        const accessToken = await getAccessToken();

        if (!accessToken || isDisposed) {
            scheduleReconnect();
            return;
        }

        socket = openAuthenticatedSocket(accessToken);

        socket.onopen = () => {
            reconnectAttempts = 0;
            pingTimer = setInterval(() => socket?.send(PING_MESSAGE), PING_INTERVAL_MS);
        };

        socket.onmessage = (event) => {
            if (typeof event.data !== "string") {
                return;
            }

            const parsedEvent = parseEvent(event.data);

            if (parsedEvent) {
                onNotification(parsedEvent);
            }
        };

        socket.onerror = () => socket?.close();

        socket.onclose = () => {
            clearTimers();
            socket = null;
            scheduleReconnect();
        };
    }

    void connect();

    return () => {
        isDisposed = true;
        clearTimers();
        socket?.close();
        socket = null;
    };
}
