import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ban, PackageCheck, PackagePlus, Truck } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { INotification, NotificationType } from "@/data/models/notification.model";
import { formatDateBr, formatTimeBr } from "@/lib/dateFormat";

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
    [NotificationType.DELIVERY_DISPATCHED]: PackagePlus,
    [NotificationType.DELIVERY_ON_THE_WAY]: Truck,
    [NotificationType.DELIVERY_COMPLETED]: PackageCheck,
    [NotificationType.PRESCRIPTION_ITEM_CANCELED]: Ban,
};

const TYPE_COLORS: Record<NotificationType, string> = {
    [NotificationType.DELIVERY_DISPATCHED]: Colors.primary,
    [NotificationType.DELIVERY_ON_THE_WAY]: Colors.info,
    [NotificationType.DELIVERY_COMPLETED]: Colors.success,
    [NotificationType.PRESCRIPTION_ITEM_CANCELED]: Colors.danger,
};

interface NotificationCardProps {
    notification: INotification;
    onPress: () => void;
}

export function NotificationCard({ notification, onPress }: Readonly<NotificationCardProps>) {
    const Icon = TYPE_ICONS[notification.type];
    const iconColor = TYPE_COLORS[notification.type];

    return (
        <TouchableOpacity
            style={[styles.card, !notification.read && styles.cardUnread]}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${notification.title}. ${notification.body}`}
            accessibilityHint={notification.read ? undefined : "Toque para marcar como lida"}
        >
            <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}1A` }]}>
                <Icon size={20} color={iconColor} />
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {notification.title}
                    </Text>
                    {notification.read ? null : <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.body}>{notification.body}</Text>

                <Text style={styles.timestamp}>
                    {formatDateBr(notification.createdAt)} às {formatTimeBr(notification.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    cardUnread: {
        borderColor: Colors.primary,
    },

    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: Radius.lg,
        alignItems: "center",
        justifyContent: "center",
    },

    content: {
        flex: 1,
        gap: 2,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },

    title: {
        flex: 1,
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary,
    },

    body: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    timestamp: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
});
