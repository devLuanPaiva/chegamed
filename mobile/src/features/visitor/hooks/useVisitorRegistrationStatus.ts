import { useCallback, useState } from "react";

import { useAuth } from "@/data/contexts/AuthContext";
import { IVisitorRegistrationRequest } from "@/data/models/visitor.model";
import { getMyRegistrationRequest } from "@/data/services/visitor.service";
import { getErrorMessage } from "@/lib/errorMessage";

/**
 * The caller decides when to load, so the home card can refresh the status
 * every time the screen regains focus.
 */
interface VisitorRegistrationStatus {
    request: IVisitorRegistrationRequest | null;
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useVisitorRegistrationStatus(): VisitorRegistrationStatus {
    const { refreshSession } = useAuth();
    const [request, setRequest] = useState<IVisitorRegistrationRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await getMyRegistrationRequest();
            setRequest(result);

            if (result?.status === "APPROVED") {
                await refreshSession();
            }
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível carregar seu cadastro."));
        } finally {
            setIsLoading(false);
        }
    }, [refreshSession]);

    return { request, isLoading, error, reload };
}
