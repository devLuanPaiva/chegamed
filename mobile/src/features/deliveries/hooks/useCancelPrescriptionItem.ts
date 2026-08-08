import { useCallback, useState } from "react";

import { cancelPrescriptionItem } from "@/data/services/prescriptionItem.service";

export function useCancelPrescriptionItem() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cancel = useCallback(async (prescriptionItemId: string): Promise<void> => {
        try {
            setIsSubmitting(true);
            await cancelPrescriptionItem(prescriptionItemId);
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return { cancel, isSubmitting };
}
