import { ApiRequestError } from "@/lib/apiFetch";

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    return fallbackMessage;
}
