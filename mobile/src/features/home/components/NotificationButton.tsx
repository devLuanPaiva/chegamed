import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Bell } from "lucide-react-native";

import { Colors, Radius, Typography } from "@/theme";
import { useNotifications } from "@/data/contexts/NotificationContext";

const NOTIFICATIONS_ROUTE = "/(protected)/notifications" as Href;
const MAX_BADGE_COUNT = 9;

export function NotificationButton() {
    const router = useRouter();
    const { unreadCount } = useNotifications();

    const hasUnread = unreadCount > 0;
    const badgeLabel = unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : String(unreadCount);

    return (
        <TouchableOpacity
            style={[styles.button, hasUnread && styles.buttonHighlighted]}
            onPress={() => router.push(NOTIFICATIONS_ROUTE)}
            hitSlop={10}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={hasUnread ? `Notificações, ${unreadCount} não lidas` : "Notificações"}
        >
            <Bell size={20} color={hasUnread ? Colors.primary : Colors.text} />

            {hasUnread ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeLabel}>{badgeLabel}</Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    buttonHighlighted: {
        borderColor: Colors.primary,
    },

    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 4,
        borderRadius: Radius.full,
        backgroundColor: Colors.danger,
        borderWidth: 2,
        borderColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },

    badgeLabel: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: 9,
        lineHeight: 12,
        color: Colors.white,
    },
});
