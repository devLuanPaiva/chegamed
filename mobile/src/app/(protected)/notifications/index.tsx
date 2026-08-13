import { useCallback, useEffect } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCheck } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { useNotifications } from "@/data/contexts/NotificationContext";
import { getNotifications } from "@/data/services/notification.service";
import { INotification } from "@/data/models/notification.model";
import { getErrorMessage } from "@/lib/errorMessage";
import { NotificationCard } from "@/features/notifications/components/NotificationCard";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { BackButton } from "@/components/shared/BackButton";

export default function NotificationsScreen() {
    const { unreadCount, lastEventAt, markAsRead, markAllAsRead } = useNotifications();
    const notifications = usePaginatedList<INotification>(getNotifications);

    const { refresh: refreshNotifications } = notifications;

    useEffect(() => {
        if (lastEventAt > 0) {
            refreshNotifications();
        }
    }, [lastEventAt, refreshNotifications]);

    const handlePressNotification = useCallback(
        async (notification: INotification) => {
            if (notification.read) {
                return;
            }

            try {
                await markAsRead(notification.id);
            } catch (error) {
                Alert.alert("Erro", getErrorMessage(error, "Não foi possível marcar como lida."));
            }
        },
        [markAsRead],
    );

    async function handleMarkAllAsRead() {
        try {
            await markAllAsRead();
        } catch (error) {
            Alert.alert("Erro", getErrorMessage(error, "Não foi possível marcar as notificações como lidas."));
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Notificações</Text>

                {unreadCount > 0 ? (
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllAsRead}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Marcar todas as notificações como lidas"
                    >
                        <CheckCheck size={16} color={Colors.primary} />
                        <Text style={styles.markAllLabel}>Marcar todas</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <PaginatedList
                data={notifications.items}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationCard notification={item} onPress={() => handlePressNotification(item)} />
                )}
                isLoading={notifications.isLoading}
                isLoadingMore={notifications.isLoadingMore}
                error={notifications.error}
                emptyMessage="Você ainda não tem notificações."
                onLoadMore={notifications.loadMore}
                onRefresh={notifications.refresh}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },

    title: {
        flex: 1,
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    markAllButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },

    markAllLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.xs,
        color: Colors.primary,
    },
});
