import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing, Typography } from "@/theme";
import { BackButton } from "@/components/shared/BackButton";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { HistoryTab, HistoryTabSwitcher } from "@/features/history/components/HistoryTabSwitcher";
import { PendingMedicationCard } from "@/features/history/components/PendingMedicationCard";
import { DeliveredMedicationCard } from "@/features/history/components/DeliveredMedicationCard";
import { useMyPendingMedications } from "@/features/history/hooks/useMyPendingMedications";
import { useMyDeliveredMedications } from "@/features/history/hooks/useMyDeliveredMedications";

export default function HistoryScreen() {
    const [activeTab, setActiveTab] = useState<HistoryTab>("pending");

    const pendingMedications = useMyPendingMedications();
    const deliveredMedications = useMyDeliveredMedications();

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Histórico</Text>
            </View>

            <View style={styles.controls}>
                <HistoryTabSwitcher value={activeTab} onChange={setActiveTab} />
            </View>

            {activeTab === "pending" ? (
                <PaginatedList
                    data={pendingMedications.items}
                    keyExtractor={(item) => item.prescriptionItemId}
                    renderItem={({ item }) => <PendingMedicationCard item={item} />}
                    isLoading={pendingMedications.isLoading}
                    isLoadingMore={pendingMedications.isLoadingMore}
                    error={pendingMedications.error}
                    emptyMessage="Nenhum medicamento pendente de entrega."
                    onLoadMore={pendingMedications.loadMore}
                    onRefresh={pendingMedications.refresh}
                />
            ) : (
                <PaginatedList
                    data={deliveredMedications.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <DeliveredMedicationCard delivery={item} />}
                    isLoading={deliveredMedications.isLoading}
                    isLoadingMore={deliveredMedications.isLoadingMore}
                    error={deliveredMedications.error}
                    emptyMessage="Nenhum medicamento entregue ainda."
                    onLoadMore={deliveredMedications.loadMore}
                    onRefresh={deliveredMedications.refresh}
                />
            )}
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
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
});
