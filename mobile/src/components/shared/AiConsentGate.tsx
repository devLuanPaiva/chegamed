import * as WebBrowser from "expo-web-browser";
import { ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PRIVACY_POLICY_URL } from "@/lib/externalLinks";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

interface AiConsentGateProps {
    title: string;
    description: string;
    bullets: string[];
    onAccept: () => void;
    onDecline: () => void;
}

export function AiConsentGate({ title, description, bullets, onAccept, onDecline }: Readonly<AiConsentGateProps>) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.iconBadge}>
                <ShieldCheck size={32} color={Colors.primary} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{description}</Text>

            <View style={styles.bulletList}>
                {bullets.map((bullet) => (
                    <View key={bullet} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
                accessibilityRole="link"
                accessibilityLabel="Ver política de privacidade completa"
            >
                <Text style={styles.link}>Ver política de privacidade completa</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.acceptButton}
                onPress={onAccept}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Aceitar e continuar"
            >
                <Text style={styles.acceptButtonText}>Aceitar e continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDecline} accessibilityRole="button" accessibilityLabel="Agora não">
                <Text style={styles.declineText}>Agora não</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.sm,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
    },

    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: Radius.full,
        backgroundColor: `${Colors.primary}1A`,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: Spacing.sm,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
        textAlign: "center",
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.md,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },

    bulletList: {
        alignSelf: "stretch",
        gap: Spacing.xs,
        marginTop: Spacing.sm,
    },

    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.sm,
    },

    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary,
        marginTop: 7,
    },

    bulletText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
        lineHeight: 19,
    },

    link: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
        textDecorationLine: "underline",
        marginTop: Spacing.sm,
    },

    acceptButton: {
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.lg,
        alignSelf: "stretch",
        alignItems: "center",
        ...Shadows.md,
    },

    acceptButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.white,
    },

    declineText: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
});
