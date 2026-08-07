import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ban, PackageCheck, Truck } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { PrescriptionStatus } from "@/data/models/prescription.model";

interface PendingItemActionsModalProps {
    item: IPendingDeliveryItem | null;
    onDispatch: () => void;
    onDeliver: () => void;
    onCancel: () => void;
    onClose: () => void;
}

interface ActionOption {
    key: string;
    icon: LucideIcon;
    label: string;
    description: string;
    color: string;
    onPress: () => void;
}

export function PendingItemActionsModal({
    item,
    onDispatch,
    onDeliver,
    onCancel,
    onClose,
}: Readonly<PendingItemActionsModalProps>) {
    const isOutForDelivery = item?.status === PrescriptionStatus.OUT_FOR_DELIVERY;

    const options: ActionOption[] = [
        ...(isOutForDelivery
            ? []
            : [
                  {
                      key: "dispatch",
                      icon: Truck,
                      label: "Enviar para entrega",
                      description: "O entregador leva o remédio até o endereço do paciente",
                      color: Colors.primary,
                      onPress: onDispatch,
                  },
              ]),
        {
            key: "deliver",
            icon: PackageCheck,
            label: "Entregar agora",
            description: "Dá baixa na entrega imediatamente, para retirada no balcão",
            color: Colors.success,
            onPress: onDeliver,
        },
        {
            key: "cancel",
            icon: Ban,
            label: "Cancelar item",
            description: "O item sai da fila e o paciente é avisado do cancelamento",
            color: Colors.danger,
            onPress: onCancel,
        },
    ];

    return (
        <Modal visible={Boolean(item)} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar">
                <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
                    {item ? (
                        <View style={styles.header}>
                            <Text style={styles.title} numberOfLines={1}>
                                {item.medicineName}
                            </Text>
                            <Text style={styles.subtitle} numberOfLines={1}>
                                {item.patientName}
                            </Text>
                        </View>
                    ) : null}

                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={styles.option}
                            onPress={option.onPress}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel={option.label}
                            accessibilityHint={option.description}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: `${option.color}1A` }]}>
                                <option.icon size={18} color={option.color} />
                            </View>

                            <View style={styles.optionText}>
                                <Text style={[styles.optionLabel, { color: option.color }]}>{option.label}</Text>
                                <Text style={styles.optionDescription}>{option.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar"
                    >
                        <Text style={styles.closeLabel}>Fechar</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(26,26,26,0.5)",
        justifyContent: "flex-end",
    },

    sheet: {
        gap: Spacing.sm,
        backgroundColor: Colors.surface,
        borderTopLeftRadius: Radius.xxl,
        borderTopRightRadius: Radius.xxl,
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
        ...Shadows.lg,
    },

    header: {
        gap: 2,
        marginBottom: Spacing.sm,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xl,
        color: Colors.text,
    },

    subtitle: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        backgroundColor: Colors.background,
        borderRadius: Radius.lg,
        padding: Spacing.md,
    },

    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: Radius.md,
        alignItems: "center",
        justifyContent: "center",
    },

    optionText: {
        flex: 1,
        gap: 2,
    },

    optionLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
    },

    optionDescription: {
        fontFamily: Typography.fonts.body,
        fontSize: Typography.sizes.xs,
        color: Colors.textSecondary,
    },

    closeButton: {
        height: 48,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: "center",
        justifyContent: "center",
        marginTop: Spacing.sm,
    },

    closeLabel: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.base,
        color: Colors.text,
    },
});
