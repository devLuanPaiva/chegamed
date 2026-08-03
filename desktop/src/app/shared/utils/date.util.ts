export function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export const FORTALEZA_TIME_ZONE = 'America/Fortaleza';
const FORTALEZA_UTC_OFFSET = '-03:00';
const HAS_OFFSET_PATTERN = /[Zz]|[+-]\d{2}:\d{2}$/;

export function parseFortalezaDateTime(value: string): Date {
    return new Date(HAS_OFFSET_PATTERN.test(value) ? value : `${value}${FORTALEZA_UTC_OFFSET}`);
}

export function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function isNotFutureDate(value: string, today: Date): boolean {
    if (!value) {
        return true;
    }

    return value <= toDateInputValue(today);
}
