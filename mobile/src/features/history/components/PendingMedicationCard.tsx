import { StyleSheet, Text, View } from "react-native";
import { Clock } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { PrescriptionStatus, PrescriptionStatusLabels } from "@/data/models/prescription.model";
import { UnityTypeLabels } from "@/data/models/prescription-item.model";
import { formatDateBr } from "@/lib/dateFormat";

interface PendingMedicationCardProps {
    item: IPendingDeliveryItem;
}

const STATUS_COLOR: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: Colors.warning,
    [PrescriptionStatus.APPROVED]: Colors.info,
    [PrescriptionStatus.REJECTED]: Colors.danger,
    [PrescriptionStatus.DELIVERED]: Colors.success,
    [PrescriptionStatus.PARTIAL_DELIVERED]: Colors.success,
};

export function PendingMedicationCard({ item }: Readonly<PendingMedicationCardProps>) {
    const statusColor = STATUS_COLOR[item.status];

    return (
        <View style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: `${statusColor}1A` }]}>
                <Clock size={22} color={statusColor} />
            </View>

            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.medicineName} numberOfLines={1}>
                        {item.medicineName}
                    </Text>

                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1A` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {PrescriptionStatusLabels[item.status]}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Pedida em</Text>
                    <Text style={styles.detailValue}>{formatDateBr(item.issueDate)}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Quantidade</Text>
                    <Text style={styles.detailValue}>
                        {item.prescribedQuantity} {UnityTypeLabels[item.unityType]}
                    </Text>
                </View>
            </View>
        </View>
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

    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: Radius.lg,
        alignItems: "center",
        justifyContent: "center",
    },

    info: {
        flex: 1,
        gap: 2,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },

    medicineName: {
        flex: 1,
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    statusBadge: {
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },

    statusText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.xs,
    },

    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    detailLabel: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    detailValue: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.xs,
        color: Colors.text,
    },
});
