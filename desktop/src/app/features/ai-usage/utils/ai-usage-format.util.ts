import { FORTALEZA_TIME_ZONE } from '@shared/utils/date.util';

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
});

export function formatUsd(value: number): string {
    return USD_FORMATTER.format(value);
}

export function formatDateTime(date: Date): string {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: FORTALEZA_TIME_ZONE,
    });
}

export function formatShortDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function formatTokens(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
}
