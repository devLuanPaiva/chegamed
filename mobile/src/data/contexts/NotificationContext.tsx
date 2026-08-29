import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useRouter, type Href } from "expo-router";

import { useAuth } from "@/data/contexts/AuthContext";
import {
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    registerDeviceToken,
} from "@/data/services/notification.service";
import {
    addPushOpenedListener,
    addPushReceivedListener,
    requestDevicePushRegistration,
    setBadgeCount,
} from "@/data/services/pushNotification.service";
import { connectNotificationSocket } from "@/lib/notificationSocket";

const NOTIFICATIONS_ROUTE = "/(protected)/notifications" as Href;

interface NotificationContextValue {
    unreadCount: number;
    lastEventAt: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
    unreadCount: 0,
    lastEventAt: 0,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
});

export function NotificationProvider({ children }: Readonly<PropsWithChildren>) {
    const { isLoggedIn } = useAuth();
    const router = useRouter();

    const [unreadCount, setUnreadCount] = useState(0);
    const [lastEventAt, setLastEventAt] = useState(0);
    const socketHandleRef = useRef<ReturnType<typeof connectNotificationSocket> | null>(null);

    const applyUnreadCount = useCallback((count: number) => {
        setUnreadCount(count);
        setBadgeCount(count).catch((error: unknown) =>
            console.warn("Não foi possível atualizar o badge do aplicativo", error),
        );
    }, []);

    const refreshUnreadCount = useCallback(async () => {
        try {
            applyUnreadCount(await getUnreadNotificationCount());
        } catch (error) {
            console.warn("Não foi possível atualizar as notificações não lidas", error);
        }
    }, [applyUnreadCount]);

    useEffect(() => {
        if (!isLoggedIn) {
            applyUnreadCount(0);
            return;
        }

        void refreshUnreadCount();
    }, [applyUnreadCount, isLoggedIn, refreshUnreadCount]);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        async function registerDevice() {
            try {
                const registration = await requestDevicePushRegistration();

                if (registration) {
                    await registerDeviceToken(registration);
                }
            } catch (error) {
                console.warn("Push nativo indisponível; as notificações seguem apenas no aplicativo", error);
            }
        }

        void registerDevice();
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        const handle = connectNotificationSocket({
            onNotification: (event) => {
                applyUnreadCount(event.unreadCount);
                setLastEventAt(Date.now());
            },
            onReconnected: () => void refreshUnreadCount(),
        });

        socketHandleRef.current = handle;

        return () => {
            socketHandleRef.current = null;
            handle.disconnect();
        };
    }, [applyUnreadCount, isLoggedIn, refreshUnreadCount]);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        function handleAppStateChange(nextState: AppStateStatus) {
            if (nextState !== "active") {
                return;
            }

            socketHandleRef.current?.reconnectNow();
            void refreshUnreadCount();
        }

        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => subscription.remove();
    }, [isLoggedIn, refreshUnreadCount]);

    useEffect(() => {
        if (!isLoggedIn) {
            return;
        }

        const receivedSubscription = addPushReceivedListener(() => {
            setLastEventAt(Date.now());
            void refreshUnreadCount();
        });

        const openedSubscription = addPushOpenedListener(() => router.push(NOTIFICATIONS_ROUTE));

        return () => {
            receivedSubscription.remove();
            openedSubscription.remove();
        };
    }, [isLoggedIn, refreshUnreadCount, router]);

    const markAsRead = useCallback(
        async (id: string) => {
            await markNotificationAsRead(id);
            setLastEventAt(Date.now());
            await refreshUnreadCount();
        },
        [refreshUnreadCount],
    );

    const markAllAsRead = useCallback(async () => {
        await markAllNotificationsAsRead();
        setLastEventAt(Date.now());
        applyUnreadCount(0);
    }, [applyUnreadCount]);

    const contextValue = useMemo(
        () => ({ unreadCount, lastEventAt, markAsRead, markAllAsRead }),
        [lastEventAt, markAllAsRead, markAsRead, unreadCount],
    );

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
