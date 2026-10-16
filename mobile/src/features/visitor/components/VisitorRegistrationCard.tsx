import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, ClipboardList, Clock } from "lucide-react-native";

import { IVisitorRegistrationRequest } from "@/data/models/visitor.model";
import { formatDateBr } from "@/lib/dateFormat";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { canSubmitRegistration, getRegistrationStatusContent } from "../utils/registrationStatus";

interface VisitorRegistrationCardProps {
    request: IVisitorRegistrationRequest | null;
    isLoading: boolean;
    error: string | null;
    onStartRegistration: () => void;
}

export function VisitorRegistrationCard({
    request,
    isLoading,
    error,
    onStartRegistration,
}: Readonly<VisitorRegistrationCardProps>) {
    if (isLoading) {
        return (
            <View style={[styles.card, styles.loadingCard]}>
                <ActivityIndicator color={Colors.primary} />
            </View>
        );
    }

    const content = getRegistrationStatusContent(request);
    const isActionable = canSubmitRegistration(request);
    const Icon = isActionable ? ClipboardList : Clock;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.iconBadge}>
                    <Icon size={22} color={Colors.primary} />
                </View>

                <View style={styles.textBlock}>
                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.description}>{content.description}</Text>
                </View>
            </View>

            {request ? (
                <Text style={styles.meta}>
                    {request.companyName} · enviado em {formatDateBr(request.createdAt)}
                </Text>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isActionable && content.actionLabel ? (
                <TouchableOpacity
                    style={styles.action}
                    onPress={onStartRegistration}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={content.actionLabel}
                >
                    <Text style={styles.actionLabel}>{content.actionLabel}</Text>
                    <ChevronRight size={18} color={Colors.white} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.xxl,
        padding: Spacing.lg,
        marginTop: Spacing.lg,
        ...Shadows.sm,
    },

    loadingCard: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: Spacing.xxl,
    },

    header: {
        flexDirection: "row",
        gap: Spacing.md,
    },

    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: Radius.lg,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
    },

    textBlock: {
        flex: 1,
        gap: Spacing.xs,
    },

    title: {
        fontFamily: Typography.fonts.bodyBold,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    description: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        lineHeight: 19,
    },

    meta: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    error: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.danger,
    },

    action: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        height: 48,
    },

    actionLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
        letterSpacing: 0.3,
    },
});
