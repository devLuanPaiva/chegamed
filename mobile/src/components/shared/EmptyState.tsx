import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Inbox, type LucideIcon } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface EmptyStateProps {
    icon?: LucideIcon;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon = Inbox,
    message,
    actionLabel,
    onAction,
}: Readonly<EmptyStateProps>) {
    return (
        <View style={styles.container}>
            <View style={styles.iconBadge}>
                <Icon size={28} color={Colors.primary} />
            </View>

            <Text style={styles.message}>{message}</Text>

            {actionLabel && onAction ? (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onAction}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={actionLabel}
                >
                    <Text style={styles.actionLabel}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },

    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
    },

    message: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.base,
        color: Colors.textSecondary,
        textAlign: "center",
    },

    actionButton: {
        marginTop: Spacing.sm,
        height: 44,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },

    actionLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.white,
    },
});
