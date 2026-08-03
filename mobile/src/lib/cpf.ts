export function onlyDigits(value: string): string {
    return value.replace(/\D/g, "");
}

export function formatCpf(value: string): string {
    const digits = onlyDigits(value).slice(0, 11);

    return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCpf(value: string): string {
    if (!value || value.includes("*")) {
        return value;
    }

    const digits = onlyDigits(value);

    if (digits.length !== 11) {
        return value;
    }

    return `${digits.slice(0, 3)}.***.***-**`;
}
