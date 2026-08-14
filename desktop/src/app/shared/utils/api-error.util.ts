import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorDetail, ApiExceptionResponse } from '../models/api-error.model';

const SERVER_DOWN_STATUSES = new Set([0, 502, 503, 504]);

export const SERVER_UNAVAILABLE_MESSAGE =
    'Não foi possível conectar ao servidor. Nosso sistema fica disponível de segunda a sexta, das 8h às 17h — tente novamente dentro desse horário.';

export function isServerUnavailableError(error: unknown): boolean {
    return error instanceof HttpErrorResponse && SERVER_DOWN_STATUSES.has(error.status);
}

function extractErrorBody(error: unknown): ApiExceptionResponse | null {
    if (!(error instanceof HttpErrorResponse)) {
        return null;
    }

    return error.error as ApiExceptionResponse | null;
}

function formatErrorDetail(error: ApiErrorDetail): string {
    return error.field ? `${error.field}: ${error.detail}` : (error.detail ?? '');
}

export function extractErrors(error: unknown): ApiErrorDetail[] {
    return extractErrorBody(error)?.errors ?? [];
}

export function extractErrorMessage(error: unknown, fallback: string): string {
    if (isServerUnavailableError(error)) {
        return SERVER_UNAVAILABLE_MESSAGE;
    }

    const body = extractErrorBody(error);
    const errors = body?.errors ?? [];

    if (errors.length === 0) {
        return body?.message || fallback;
    }

    if (errors.length === 1) {
        return errors[0].detail || body?.message || fallback;
    }

    return errors.map(formatErrorDetail).join('; ');
}

export function fieldErrorMessage(errors: readonly ApiErrorDetail[] | null | undefined, field: string): string | null {
    return errors?.find((error) => error.field === field)?.detail ?? null;
}
