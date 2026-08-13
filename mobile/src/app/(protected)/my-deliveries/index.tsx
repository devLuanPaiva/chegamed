import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { getErrorMessage } from "@/lib/errorMessage";
import { openMapForAddress, openPhoneCall } from "@/lib/externalLinks";
import { DeliverItemModal } from "@/features/deliveries/components/DeliverItemModal";
import { CompletedDeliveryCard } from "@/features/deliveries/components/CompletedDeliveryCard";
import { useMyDeliveryRoutes } from "@/features/myDeliveries/hooks/useMyDeliveryRoutes";
import { DeliveryRouteCard } from "@/features/myDeliveries/components/DeliveryRouteCard";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { SegmentedTabOption, SegmentedTabs } from "@/components/shared/SegmentedTabs";
import { BackButton } from "@/components/shared/BackButton";

type MyDeliveryTab = "pending" | "completed";

const TABS: SegmentedTabOption<MyDeliveryTab>[] = [
    { value: "pending", label: "Pendentes" },
    { value: "completed", label: "Entregues" },
];

export default function MyDeliveriesScreen() {
    const routes = useMyDeliveryRoutes();

    const [activeTab, setActiveTab] = useState<MyDeliveryTab>("pending");
    const [deliveringItem, setDeliveringItem] = useState<IPendingDeliveryItem | null>(null);

    async function handleConfirmDelivery(quantity: number) {
        if (!deliveringItem) {
            return;
        }

        try {
            await routes.deliverItem(deliveringItem, quantity);
            setDeliveringItem(null);
            Alert.alert("Entrega concluída", "O paciente foi avisado de que o remédio foi entregue.");
        } catch (error) {
            Alert.alert("Erro", getErrorMessage(error, "Não foi possível concluir a entrega."));
        }
    }

    async function handleOpenMap(item: IPendingDeliveryItem) {
        if (!item.patientAddress) {
            return;
        }

        const opened = await openMapForAddress(item.patientAddress);

        if (!opened) {
            Alert.alert("Erro", "Não foi possível abrir o mapa.");
        }
    }

    async function handleCallPatient(item: IPendingDeliveryItem) {
        if (!item.patientContact) {
            return;
        }

        const opened = await openPhoneCall(item.patientContact);

        if (!opened) {
            Alert.alert("Erro", "Não foi possível iniciar a chamada.");
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Minhas entregas</Text>
            </View>

            <View style={styles.controls}>
                <SegmentedTabs options={TABS} value={activeTab} onChange={setActiveTab} />
            </View>

            {activeTab === "pending" ? (
                <PaginatedList
                    data={routes.pending.items}
                    keyExtractor={(item) => item.prescriptionItemId}
                    renderItem={({ item }) => (
                        <DeliveryRouteCard
                            item={item}
                            isBusy={routes.isSubmitting}
                            onDeliver={() => setDeliveringItem(item)}
                            onOpenMap={() => handleOpenMap(item)}
                            onCallPatient={() => handleCallPatient(item)}
                        />
                    )}
                    isLoading={routes.pending.isLoading}
                    isLoadingMore={routes.pending.isLoadingMore}
                    error={routes.pending.error}
                    emptyMessage="Nenhuma entrega pendente no momento."
                    onLoadMore={routes.pending.loadMore}
                    onRefresh={routes.pending.refresh}
                />
            ) : (
                <PaginatedList
                    data={routes.completed.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CompletedDeliveryCard delivery={item} showPatientAddress />}
                    isLoading={routes.completed.isLoading}
                    isLoadingMore={routes.completed.isLoadingMore}
                    error={routes.completed.error}
                    emptyMessage="Você ainda não concluiu nenhuma entrega."
                    onLoadMore={routes.completed.loadMore}
                    onRefresh={routes.completed.refresh}
                />
            )}

            <DeliverItemModal
                item={deliveringItem}
                isSubmitting={routes.isSubmitting}
                onConfirm={handleConfirmDelivery}
                onCancel={() => setDeliveringItem(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    controls: {
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
});
