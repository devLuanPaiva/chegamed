import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MapPin, MoreVertical, PackageCheck, Truck } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { UnityTypeLabels } from "@/data/models/prescription-item.model";
import { PrescriptionStatus } from "@/data/models/prescription.model";
import { formatDateBr } from "@/lib/dateFormat";

interface PendingDeliveryItemCardProps {
    item: IPendingDeliveryItem;
    isBusy?: boolean;
    onDispatch: () => void;
    onDeliver: () => void;
    onOpenActions: () => void;
}

export function PendingDeliveryItemCard({
    item,
    isBusy = false,
    onDispatch,
    onDeliver,
    onOpenActions,
}: Readonly<PendingDeliveryItemCardProps>) {
    const isOutForDelivery = item.status === PrescriptionStatus.OUT_FOR_DELIVERY;

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.info}>
                    <Text style={styles.patientName} numberOfLines={1}>
                        {item.patientName}
                    </Text>
                    <Text style={styles.medicineName} numberOfLines={1}>
                        {item.medicineName}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.actionsButton}
                    onPress={onOpenActions}
                    hitSlop={10}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Mais opções para ${item.medicineName} de ${item.patientName}`}
                >
                    <MoreVertical size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {isOutForDelivery ? (
                <View style={styles.statusBadge}>
                    <Truck size={14} color={Colors.info} />
                    <Text style={styles.statusBadgeLabel}>
                        {item.outForDeliveryAt
                            ? `Em entrega desde ${formatDateBr(item.outForDeliveryAt)}`
                            : "Em entrega"}
                    </Text>
                </View>
            ) : null}

            <View style={styles.details}>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Emitida em</Text>
                    <Text style={styles.detailValue}>{formatDateBr(item.issueDate)}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Quantidade necessária</Text>
                    <Text style={styles.detailValue}>
                        {item.prescribedQuantity} {UnityTypeLabels[item.unityType]}
                    </Text>
                </View>

                {item.patientAddress ? (
                    <View style={styles.addressRow}>
                        <MapPin size={14} color={Colors.textSecondary} />
                        <Text style={styles.addressText} numberOfLines={2}>
                            {item.patientAddress}
                        </Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.actions}>
                {isOutForDelivery ? null : (
                    <TouchableOpacity
                        style={[styles.button, styles.dispatchButton, isBusy && styles.buttonDisabled]}
                        onPress={onDispatch}
                        disabled={isBusy}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel={`Enviar ${item.medicineName} para entrega no endereço de ${item.patientName}`}
                        accessibilityHint="O remédio entra na fila do entregador e o paciente é avisado"
                    >
                        <Truck size={16} color={Colors.primary} />
                        <Text style={styles.dispatchButtonText}>Enviar para entrega</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.button, styles.deliverButton, isBusy && styles.buttonDisabled]}
                    onPress={onDeliver}
                    disabled={isBusy}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Entregar ${item.medicineName} para ${item.patientName} agora`}
                    accessibilityHint="Dá baixa na entrega imediatamente, para retirada no balcão"
                >
                    <PackageCheck size={16} color={Colors.white} />
                    <Text style={styles.deliverButtonText}>Entregar agora</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        ...Shadows.sm,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.sm,
    },

    info: {
        flex: 1,
        gap: 2,
    },

    actionsButton: {
        width: 28,
        height: 28,
        borderRadius: Radius.full,
        alignItems: "center",
        justifyContent: "center",
    },

    patientName: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },

    medicineName: {
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: Spacing.xs,
        backgroundColor: `${Colors.info}1A`,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },

    statusBadgeLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.xs,
        color: Colors.info,
    },

    details: {
        gap: 2,
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

    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.xs,
        marginTop: Spacing.xs,
    },

    addressText: {
        flex: 1,
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    actions: {
        gap: Spacing.sm,
    },

    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        borderRadius: Radius.full,
        height: 44,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    dispatchButton: {
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },

    dispatchButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
    },

    deliverButton: {
        backgroundColor: Colors.primary,
    },

    deliverButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },
});
