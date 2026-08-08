import { useCallback, useState } from "react";

import { dispatchPrescriptionItemForDelivery } from "@/data/services/delivery.service";

export function useDispatchPrescriptionItem() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatchForDelivery = useCallback(async (prescriptionItemId: string): Promise<void> => {
        try {
            setIsSubmitting(true);
            await dispatchPrescriptionItemForDelivery(prescriptionItemId);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return { dispatchForDelivery, isSubmitting };
}
