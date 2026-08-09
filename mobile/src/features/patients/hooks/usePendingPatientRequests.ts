import { useCallback, useState } from "react";

import { usePaginatedList } from "@/data/hooks/usePaginatedList";
import {
    approveRegistrationRequest,
    getPendingRegistrationRequests,
    rejectRegistrationRequest,
} from "@/data/services/patient.service";

export function usePendingPatientRequests() {
    const fetchPage = useCallback((page: number) => getPendingRegistrationRequests(page), []);
    const list = usePaginatedList(fetchPage);

    const [reviewingId, setReviewingId] = useState<string | null>(null);

    const approve = useCallback(
        async (id: string) => {
            setReviewingId(id);

            try {
                await approveRegistrationRequest(id);
                list.refresh();
            } finally {
                setReviewingId(null);
            }
        },
        [list],
    );

    const reject = useCallback(
        async (id: string) => {
            setReviewingId(id);

            try {
                await rejectRegistrationRequest(id);
                list.refresh();
            } finally {
                setReviewingId(null);
            }
        },
        [list],
    );

    return { ...list, reviewingId, approve, reject };
}
