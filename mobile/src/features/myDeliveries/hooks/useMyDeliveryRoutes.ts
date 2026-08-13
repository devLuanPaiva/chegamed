import { useCallback, useEffect } from "react";

import { useNotifications } from "@/data/contexts/NotificationContext";
import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { IPendingDeliveryItem } from "@/data/models/delivery.model";
import { getMyCompletedDeliveries, getMyOutForDeliveryItems } from "@/data/services/delivery.service";
import { todayIso } from "@/lib/dateFormat";
import { useDeliverPrescriptionItem } from "@/features/deliveries/hooks/useDeliverPrescriptionItem";

export function useMyDeliveryRoutes() {
    const { lastEventAt } = useNotifications();

    const pending = usePaginatedList(getMyOutForDeliveryItems);
    const completed = usePaginatedList(getMyCompletedDeliveries);
    const { deliver, isSubmitting } = useDeliverPrescriptionItem();

    const { refresh: refreshPending } = pending;
    const { refresh: refreshCompleted } = completed;

    useEffect(() => {
        if (lastEventAt > 0) {
            refreshPending();
        }
    }, [lastEventAt, refreshPending]);

    const deliverItem = useCallback(
        async (item: IPendingDeliveryItem, quantity: number) => {
            await deliver({
                prescriptionItemId: item.prescriptionItemId,
                deliveryDate: todayIso(),
                deliveryQuantity: quantity,
            });

            refreshPending();
            refreshCompleted();
        },
        [deliver, refreshCompleted, refreshPending],
    );

    return { pending, completed, isSubmitting, deliverItem };
}
