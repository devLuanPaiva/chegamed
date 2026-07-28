import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { getMyPendingDeliveryItems } from "@/data/services/delivery.service";

export function useMyPendingMedications() {
    return usePaginatedList(getMyPendingDeliveryItems);
}
