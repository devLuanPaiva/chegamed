import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MapPin, PackageCheck, Phone } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { UnityTypeLabels } from "@/data/models/prescription-item.model";
import { formatDateBr } from "@/lib/dateFormat";

interface DeliveryRouteCardProps {
    item: IPendingDeliveryItem;
    isBusy?: boolean;
    onDeliver: () => void;
    onOpenMap: () => void;
    onCallPatient: () => void;
}

export function DeliveryRouteCard({
    item,
    isBusy = false,
    onDeliver,
    onOpenMap,
    onCallPatient,
}: Readonly<DeliveryRouteCardProps>) {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.patientName} numberOfLines={1}>
                    {item.patientName}
                </Text>
                <Text style={styles.medicineName} numberOfLines={1}>
                    {item.medicineName}
                    {item.dosage ? ` · ${item.dosage}` : ""}
                </Text>
            </View>

            <View style={styles.details}>
                <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>Quantidade a entregar</Text>
                    <Text style={styles.detailValue}>
                        {item.prescribedQuantity} {UnityTypeLabels[item.unityType]}
                    </Text>
                </View>

                {item.outForDeliveryAt ? (
                    <View style={styles.detailsRow}>
                        <Text style={styles.detailLabel}>Enviado em</Text>
                        <Text style={styles.detailValue}>{formatDateBr(item.outForDeliveryAt)}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.addressBox}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.addressText}>{item.patientAddress ?? "Endereço não informado"}</Text>
            </View>

            <View style={styles.secondaryActions}>
                {item.patientAddress ? (
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onOpenMap}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel={`Abrir o endereço de ${item.patientName} no mapa`}
                    >
                        <MapPin size={14} color={Colors.primary} />
                        <Text style={styles.secondaryButtonText}>Ver no mapa</Text>
                    </TouchableOpacity>
                ) : null}

                {item.patientContact ? (
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onCallPatient}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel={`Ligar para ${item.patientName}`}
                    >
                        <Phone size={14} color={Colors.primary} />
                        <Text style={styles.secondaryButtonText}>Ligar</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            <TouchableOpacity
                style={[styles.deliverButton, isBusy && styles.deliverButtonDisabled]}
                onPress={onDeliver}
                disabled={isBusy}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`Confirmar a entrega de ${item.medicineName} para ${item.patientName}`}
            >
                <PackageCheck size={16} color={Colors.white} />
                <Text style={styles.deliverButtonText}>Entregar</Text>
            </TouchableOpacity>
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

    info: {
        gap: 2,
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

    addressBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Spacing.sm,
        backgroundColor: Colors.background,
        borderRadius: Radius.lg,
        padding: Spacing.md,
    },

    addressText: {
        flex: 1,
        fontFamily: Typography.fonts.bodyMedium,
        fontSize: Typography.sizes.sm,
        color: Colors.text,
    },

    secondaryActions: {
        flexDirection: "row",
        gap: Spacing.sm,
    },

    secondaryButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        height: 38,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    secondaryButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.xs,
        color: Colors.primary,
    },

    deliverButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: Colors.primary,
    },

    deliverButtonDisabled: {
        opacity: 0.6,
    },

    deliverButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.white,
    },
});
