const DEFAULT_MAX_VISIBLE_PAGES = 5;

export function buildPageWindow(
    currentPage: number,
    totalPages: number,
    maxVisible = DEFAULT_MAX_VISIBLE_PAGES,
): number[] {
    if (totalPages <= 0) {
        return [];
    }

    if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = currentPage - half;
    let end = currentPage + (maxVisible - half - 1);

    if (start < 1) {
        end += 1 - start;
        start = 1;
    }

    if (end > totalPages) {
        start -= end - totalPages;
        end = totalPages;
    }

    start = Math.max(start, 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
