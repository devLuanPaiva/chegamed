import { useCallback, useMemo, useState } from "react";

import { useCompanies } from "@/data/contexts/CompanyContext";
import { useDebouncedValue } from "@/data/hooks/useDebouncedValue";
import { DeliveryFilterParams, IPendingDeliveryItem } from "@/data/models/delivery.model";
import { PrescriptionStatus } from "@/data/models/prescription.model";
import { todayIso } from "@/lib/dateFormat";
import { useCompletedDeliveries } from "@/features/deliveries/hooks/useCompletedDeliveries";
import { usePendingDeliveryItems } from "@/features/deliveries/hooks/usePendingDeliveryItems";
import { useCancelPrescriptionItem } from "@/features/deliveries/hooks/useCancelPrescriptionItem";
import { useDeliverPrescriptionItem } from "@/features/deliveries/hooks/useDeliverPrescriptionItem";
import { useDispatchPrescriptionItem } from "@/features/deliveries/hooks/useDispatchPrescriptionItem";

const FILTER_DEBOUNCE_MS = 400;

export type DeliveryQueueTab = "pending" | "outForDelivery" | "completed";

export function useDeliveryQueues() {
    const { selectedCompany } = useCompanies();

    const [patientName, setPatientName] = useState("");
    const [patientCpf, setPatientCpf] = useState("");

    const debouncedName = useDebouncedValue(patientName, FILTER_DEBOUNCE_MS);
    const debouncedCpf = useDebouncedValue(patientCpf, FILTER_DEBOUNCE_MS);

    const baseFilter = useMemo<DeliveryFilterParams>(
        () => ({ patientName: debouncedName, patientCpf: debouncedCpf }),
        [debouncedName, debouncedCpf],
    );

    const pendingFilter = useMemo<DeliveryFilterParams>(
        () => ({ ...baseFilter, status: PrescriptionStatus.PENDING }),
        [baseFilter],
    );

    const outForDeliveryFilter = useMemo<DeliveryFilterParams>(
        () => ({ ...baseFilter, status: PrescriptionStatus.OUT_FOR_DELIVERY }),
        [baseFilter],
    );

    const completed = useCompletedDeliveries(selectedCompany?.id, baseFilter);
    const pending = usePendingDeliveryItems(selectedCompany?.id, pendingFilter);
    const outForDelivery = usePendingDeliveryItems(selectedCompany?.id, outForDeliveryFilter);

    const { deliver, isSubmitting: isDelivering } = useDeliverPrescriptionItem();
    const { dispatchForDelivery, isSubmitting: isDispatching } = useDispatchPrescriptionItem();
    const { cancel, isSubmitting: isCanceling } = useCancelPrescriptionItem();

    const { refresh: refreshPending } = pending;
    const { refresh: refreshOutForDelivery } = outForDelivery;
    const { refresh: refreshCompleted } = completed;

    const refreshQueues = useCallback(() => {
        refreshPending();
        refreshOutForDelivery();
    }, [refreshOutForDelivery, refreshPending]);

    const dispatchItem = useCallback(
        async (item: IPendingDeliveryItem) => {
            await dispatchForDelivery(item.prescriptionItemId);
            refreshQueues();
        },
        [dispatchForDelivery, refreshQueues],
    );

    const deliverItem = useCallback(
        async (item: IPendingDeliveryItem, quantity: number) => {
            await deliver({
                prescriptionItemId: item.prescriptionItemId,
                deliveryDate: todayIso(),
                deliveryQuantity: quantity,
            });

            refreshQueues();
            refreshCompleted();
        },
        [deliver, refreshCompleted, refreshQueues],
    );

    const cancelItem = useCallback(
        async (item: IPendingDeliveryItem) => {
            await cancel(item.prescriptionItemId);
            refreshQueues();
        },
        [cancel, refreshQueues],
    );

    return {
        patientName,
        patientCpf,
        setPatientName,
        setPatientCpf,
        pending,
        outForDelivery,
        completed,
        isDelivering,
        isDispatching,
        isCanceling,
        dispatchItem,
        deliverItem,
        cancelItem,
    };
}
