import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing, Typography } from "@/theme";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { getErrorMessage } from "@/lib/errorMessage";
import { DeliveryQueueTab, useDeliveryQueues } from "@/features/deliveries/hooks/useDeliveryQueues";
import { DeliveryFilterBar } from "@/features/deliveries/components/DeliveryFilterBar";
import { CompletedDeliveryCard } from "@/features/deliveries/components/CompletedDeliveryCard";
import { PendingDeliveryItemCard } from "@/features/deliveries/components/PendingDeliveryItemCard";
import { PendingItemActionsModal } from "@/features/deliveries/components/PendingItemActionsModal";
import { DeliverItemModal } from "@/features/deliveries/components/DeliverItemModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { SegmentedTabOption, SegmentedTabs } from "@/components/shared/SegmentedTabs";
import { BackButton } from "@/components/shared/BackButton";

const TABS: SegmentedTabOption<DeliveryQueueTab>[] = [
    { value: "pending", label: "Pendentes" },
    { value: "outForDelivery", label: "Em entrega" },
    { value: "completed", label: "Realizadas" },
];

export default function DeliveriesScreen() {
    const queues = useDeliveryQueues();

    const [activeTab, setActiveTab] = useState<DeliveryQueueTab>("pending");
    const [actionsItem, setActionsItem] = useState<IPendingDeliveryItem | null>(null);
    const [deliveringItem, setDeliveringItem] = useState<IPendingDeliveryItem | null>(null);
    const [cancelingItem, setCancelingItem] = useState<IPendingDeliveryItem | null>(null);

    const activeQueue = activeTab === "outForDelivery" ? queues.outForDelivery : queues.pending;

    async function handleDispatch(item: IPendingDeliveryItem) {
        setActionsItem(null);

        try {
            await queues.dispatchItem(item);
            Alert.alert(
                "Enviado para entrega",
                `${item.medicineName} entrou na fila do entregador e ${item.patientName} foi avisado.`,
            );
        } catch (error) {
            Alert.alert("Erro", getErrorMessage(error, "Não foi possível enviar o item para entrega."));
        }
    }

    async function handleConfirmDelivery(quantity: number) {
        if (!deliveringItem) {
            return;
        }

        try {
            await queues.deliverItem(deliveringItem, quantity);
            setDeliveringItem(null);
            Alert.alert("Sucesso", "Entrega registrada com sucesso.");
        } catch (error) {
            Alert.alert("Erro", getErrorMessage(error, "Não foi possível registrar a entrega."));
        }
    }

    async function handleConfirmCancel() {
        if (!cancelingItem) {
            return;
        }

        try {
            await queues.cancelItem(cancelingItem);
            setCancelingItem(null);
            Alert.alert("Item cancelado", "O paciente foi avisado do cancelamento.");
        } catch (error) {
            Alert.alert("Erro", getErrorMessage(error, "Não foi possível cancelar o item."));
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Entregas</Text>
            </View>

            <View style={styles.controls}>
                <SegmentedTabs options={TABS} value={activeTab} onChange={setActiveTab} />
                <DeliveryFilterBar
                    name={queues.patientName}
                    cpf={queues.patientCpf}
                    onChangeName={queues.setPatientName}
                    onChangeCpf={queues.setPatientCpf}
                />
            </View>

            {activeTab === "completed" ? (
                <PaginatedList
                    data={queues.completed.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CompletedDeliveryCard delivery={item} showNextAvailableDate />}
                    isLoading={queues.completed.isLoading}
                    isLoadingMore={queues.completed.isLoadingMore}
                    error={queues.completed.error}
                    emptyMessage="Nenhuma entrega realizada encontrada."
                    onLoadMore={queues.completed.loadMore}
                    onRefresh={queues.completed.refresh}
                />
            ) : (
                <PaginatedList
                    data={activeQueue.items}
                    keyExtractor={(item) => item.prescriptionItemId}
                    renderItem={({ item }) => (
                        <PendingDeliveryItemCard
                            item={item}
                            isBusy={queues.isDispatching}
                            onDispatch={() => handleDispatch(item)}
                            onDeliver={() => setDeliveringItem(item)}
                            onOpenActions={() => setActionsItem(item)}
                        />
                    )}
                    isLoading={activeQueue.isLoading}
                    isLoadingMore={activeQueue.isLoadingMore}
                    error={activeQueue.error}
                    emptyMessage={
                        activeTab === "outForDelivery"
                            ? "Nenhum item a caminho do paciente."
                            : "Nenhum item aguardando na farmácia."
                    }
                    onLoadMore={activeQueue.loadMore}
                    onRefresh={activeQueue.refresh}
                />
            )}

            <PendingItemActionsModal
                item={actionsItem}
                onDispatch={() => (actionsItem ? handleDispatch(actionsItem) : undefined)}
                onDeliver={() => {
                    setDeliveringItem(actionsItem);
                    setActionsItem(null);
                }}
                onCancel={() => {
                    setCancelingItem(actionsItem);
                    setActionsItem(null);
                }}
                onClose={() => setActionsItem(null)}
            />

            <DeliverItemModal
                item={deliveringItem}
                isSubmitting={queues.isDelivering}
                onConfirm={handleConfirmDelivery}
                onCancel={() => setDeliveringItem(null)}
            />

            <ConfirmDialog
                visible={Boolean(cancelingItem)}
                title="Cancelar item"
                message={
                    cancelingItem
                        ? `${cancelingItem.medicineName} sairá da fila de entregas e ${cancelingItem.patientName} será avisado do cancelamento.`
                        : ""
                }
                confirmLabel={queues.isCanceling ? "Cancelando..." : "Cancelar item"}
                cancelLabel="Voltar"
                destructive
                onConfirm={handleConfirmCancel}
                onCancel={() => setCancelingItem(null)}
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
