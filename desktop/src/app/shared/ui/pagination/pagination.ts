import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { buildPageWindow } from '@shared/utils/pagination-window.util';

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.html',
    styleUrl: './pagination.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
    readonly pagination = input.required<PaginationInfo>();

    readonly previousPage = output<void>();
    readonly nextPage = output<void>();
    readonly pageSelected = output<number>();

    readonly pageNumbers = computed(() =>
        buildPageWindow(this.pagination().currentPage, this.pagination().totalPages),
    );
}
