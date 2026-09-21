import { useCallback, useEffect, useState } from "react";

import { IVisitorCompany } from "@/data/models/visitor.model";
import { getCompaniesOpenForRegistration } from "@/data/services/visitor.service";
import { getErrorMessage } from "@/lib/errorMessage";

interface VisitorCompanies {
    companies: IVisitorCompany[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useVisitorCompanies(): VisitorCompanies {
    const [companies, setCompanies] = useState<IVisitorCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            setCompanies(await getCompaniesOpenForRegistration());
        } catch (err) {
            setError(getErrorMessage(err, "Não foi possível carregar as farmácias disponíveis."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { companies, isLoading, error, reload };
}
