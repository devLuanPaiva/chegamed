import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Pagination, PaginationInfo } from '@shared/ui/pagination/pagination';

import { AiContentTypeLabels, AiOperationTypeLabels, IAiUsageLog } from '../../models/ai-usage.model';
import { formatDateTime, formatTokens, formatUsd } from '../../utils/ai-usage-format.util';

@Component({
    selector: 'app-ai-usage-table',
    imports: [Pagination],
    templateUrl: './ai-usage-table.html',
    styleUrl: './ai-usage-table.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsageTable {
    readonly logs = input.required<IAiUsageLog[]>();
    readonly pagination = input.required<PaginationInfo>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly retry = output<void>();
    readonly previousPage = output<void>();
    readonly nextPage = output<void>();

    readonly AiOperationTypeLabels = AiOperationTypeLabels;
    readonly AiContentTypeLabels = AiContentTypeLabels;
    readonly formatDateTime = formatDateTime;
    readonly formatTokens = formatTokens;
    readonly formatUsd = formatUsd;
}
