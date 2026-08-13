import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, Mail, Phone, X } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPatientRegistrationRequest } from "@/data/models/patient.model";

interface PendingPatientRequestCardProps {
    request: IPatientRegistrationRequest;
    isBusy: boolean;
    onApprove: () => void;
    onReject: () => void;
}

export function PendingPatientRequestCard({
    request,
    isBusy,
    onApprove,
    onReject,
}: Readonly<PendingPatientRequestCardProps>) {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {request.name}
                </Text>
                <Text style={styles.cpfText}>{request.maskedCpf}</Text>

                <View style={styles.detailRow}>
                    <Mail size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {request.email}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Phone size={14} color={Colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {request.contact || "Contato não informado"}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={onApprove}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Aprovar cadastro de ${request.name}`}
                >
                    <Check size={18} color={Colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={onReject}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Recusar cadastro de ${request.name}`}
                >
                    <X size={18} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    info: {
        flex: 1,
        gap: 2,
    },

    name: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    cpfText: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },

    detailText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    actions: {
        flexDirection: "row",
        gap: Spacing.sm,
    },

    actionButton: {
        width: 40,
        height: 40,
        borderRadius: Radius.lg,
        alignItems: "center",
        justifyContent: "center",
    },

    approveButton: {
        backgroundColor: Colors.primary,
    },

    rejectButton: {
        backgroundColor: Colors.danger,
    },
});
