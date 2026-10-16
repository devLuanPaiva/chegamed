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
import { NOTIFIABLE_ROLES } from "@/data/models/user.model";
import {
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    registerDeviceToken,
} from "@/data/services/notification.service";
import {
    addPushOpenedListener,
    addPushReceivedListener,
    presentLocalNotification,
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
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();

    const receivesNotifications =
        isLoggedIn && Boolean(user?.role && NOTIFIABLE_ROLES.includes(user.role));

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
        if (!receivesNotifications) {
            applyUnreadCount(0);
            return;
        }

        void refreshUnreadCount();
    }, [applyUnreadCount, receivesNotifications, refreshUnreadCount]);

    useEffect(() => {
        if (!receivesNotifications) {
            return;
        }

        async function registerDevice() {
            try {
                const registration = await requestDevicePushRegistration();

                if (registration) {
                    await registerDeviceToken(registration);
                    console.log(`[notifications] device token registrado na api (platform=${registration.platform})`);
                } else {
                    console.warn("[notifications] nenhum device token obtido; push nativo não será registrado");
                }
            } catch (error) {
                console.warn("Push nativo indisponível; as notificações seguem apenas no aplicativo", error);
            }
        }

        void registerDevice();
    }, [receivesNotifications]);

    useEffect(() => {
        if (!receivesNotifications) {
            return;
        }

        const handle = connectNotificationSocket({
            onNotification: (event) => {
                applyUnreadCount(event.unreadCount);
                setLastEventAt(Date.now());
                void presentLocalNotification(event.notification.title, event.notification.body);
            },
            onReconnected: () => void refreshUnreadCount(),
        });

        socketHandleRef.current = handle;

        return () => {
            socketHandleRef.current = null;
            handle.disconnect();
        };
    }, [applyUnreadCount, receivesNotifications, refreshUnreadCount]);

    useEffect(() => {
        if (!receivesNotifications) {
            return;
        }

        function handleAppStateChange(nextState: AppStateStatus) {
            if (nextState !== "active") {
                return;
            }

            console.log("[notifications] app voltou ao primeiro plano; forçando reconexão e atualização");
            socketHandleRef.current?.reconnectNow();
            void refreshUnreadCount();
        }

        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => subscription.remove();
    }, [receivesNotifications, refreshUnreadCount]);

    useEffect(() => {
        if (!receivesNotifications) {
            return;
        }

        const receivedSubscription = addPushReceivedListener(() => {
            console.log("[notifications] push nativo recebido em primeiro plano");
            setLastEventAt(Date.now());
            void refreshUnreadCount();
        });

        const openedSubscription = addPushOpenedListener(() => {
            console.log("[notifications] push nativo aberto pelo usuário");
            router.push(NOTIFICATIONS_ROUTE);
        });

        return () => {
            receivedSubscription.remove();
            openedSubscription.remove();
        };
    }, [receivesNotifications, refreshUnreadCount, router]);

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
