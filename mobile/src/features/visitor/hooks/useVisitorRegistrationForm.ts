import { useState } from "react";

import { IVisitorRegistrationRequest } from "@/data/models/visitor.model";
import { createVisitorRegistrationRequest } from "@/data/services/visitor.service";
import { DEFAULT_VISITOR_COMPANY_ID } from "@/features/visitor/constants";
import { validateRegistration } from "@/features/visitor/utils/validateRegistration";
import { ApiRequestError } from "@/lib/apiFetch";
import { onlyDigits } from "@/lib/cpf";
import { brToIso } from "@/lib/dateFormat";

export interface VisitorRegistrationFormValues {
    name: string;
    cpf: string;
    birthDate: string;
    contact: string;
    address: string;
}

const EMPTY_VALUES: VisitorRegistrationFormValues = {
    name: "",
    cpf: "",
    birthDate: "",
    contact: "",
    address: "",
};

interface UseVisitorRegistrationFormOptions {
    initialName?: string;
    onSuccess: (request: IVisitorRegistrationRequest) => void;
}

export function useVisitorRegistrationForm({
    initialName,
    onSuccess,
}: Readonly<UseVisitorRegistrationFormOptions>) {
    const [values, setValues] = useState<VisitorRegistrationFormValues>({
        ...EMPTY_VALUES,
        name: initialName ?? "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formErrorField, setFormErrorField] = useState<string | undefined>(undefined);

    function setField<K extends keyof VisitorRegistrationFormValues>(
        field: K,
        value: VisitorRegistrationFormValues[K],
    ) {
        setValues((current) => ({ ...current, [field]: value }));
    }

    async function submit() {
        const validationError = validateRegistration(values);

        if (validationError) {
            setFormError(validationError.message);
            setFormErrorField(validationError.field);
            return;
        }

        try {
            setFormError(null);
            setFormErrorField(undefined);
            setIsSubmitting(true);

            const request = await createVisitorRegistrationRequest({
                companyId: DEFAULT_VISITOR_COMPANY_ID,
                name: values.name.trim(),
                cpf: onlyDigits(values.cpf),
                birthDate: brToIso(values.birthDate),
                contact: values.contact.trim() || undefined,
                address: values.address.trim() || undefined,
            });

            onSuccess(request);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setFormError(err.message);
                setFormErrorField(err.field);
            } else {
                setFormError("Não foi possível enviar seu cadastro.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return { values, setField, isSubmitting, formError, formErrorField, submit };
}
