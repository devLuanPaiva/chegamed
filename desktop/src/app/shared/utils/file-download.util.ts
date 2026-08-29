export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}

export function extractFilename(contentDisposition: string | null, fallback: string): string {
    if (!contentDisposition) {
        return fallback;
    }

    const encodedMatch = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    if (encodedMatch) {
        return decodeURIComponent(encodedMatch[1]);
    }

    const quotedMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (quotedMatch) {
        return quotedMatch[1];
    }

    return fallback;
}
