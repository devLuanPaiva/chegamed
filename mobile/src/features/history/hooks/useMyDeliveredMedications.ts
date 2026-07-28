import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import { getMyDeliveries } from "@/data/services/delivery.service";

export function useMyDeliveredMedications() {
    return usePaginatedList(getMyDeliveries);
}
