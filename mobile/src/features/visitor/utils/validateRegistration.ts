import { onlyDigits } from "@/lib/cpf";
import { isPastOrPresentBrDate, isValidBrDate } from "@/lib/dateFormat";
import { VisitorRegistrationFormValues } from "@/features/visitor/hooks/useVisitorRegistrationForm";

export interface RegistrationFieldError {
    field: keyof VisitorRegistrationFormValues;
    message: string;
}

export function validateRegistration(
    values: VisitorRegistrationFormValues,
): RegistrationFieldError | null {
    if (!values.companyId) {
        return { field: "companyId", message: "Escolha a farmácia que acompanha seu tratamento." };
    }

    if (!values.name.trim()) {
        return { field: "name", message: "Informe seu nome completo." };
    }

    if (onlyDigits(values.cpf).length !== 11) {
        return { field: "cpf", message: "Informe um CPF válido." };
    }

    if (!isValidBrDate(values.birthDate)) {
        return { field: "birthDate", message: "Informe uma data de nascimento válida." };
    }

    if (!isPastOrPresentBrDate(values.birthDate)) {
        return { field: "birthDate", message: "A data de nascimento não pode ser futura." };
    }

    return null;
}
