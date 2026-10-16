import { useState } from "react";

import { ApiRequestError } from "@/lib/apiFetch";
import { deleteAccount } from "@/data/services/auth.service";

interface UseDeleteAccountOptions {
    requiresPassword: boolean;
    onSuccess: () => void;
}

export function useDeleteAccount({ requiresPassword, onSuccess }: Readonly<UseDeleteAccountOptions>) {
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function reset() {
        setPassword("");
        setFormError(null);
    }

    async function submit() {
        if (requiresPassword && !password) {
            setFormError("Informe sua senha para confirmar.");
            return;
        }

        try {
            setFormError(null);
            setIsSubmitting(true);
            await deleteAccount({ password });
            onSuccess();
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
            } else {
                setFormError("Não foi possível excluir a conta.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        password,
        setPassword,
        isSubmitting,
        formError,
        submit,
        reset,
    };
}
