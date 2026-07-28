import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';

import { IAiUsageSummary } from '../../models/ai-usage.model';
import { formatTokens, formatUsd } from '../../utils/ai-usage-format.util';

@Component({
    selector: 'app-ai-usage-summary',
    imports: [WidgetCard, StatTile],
    templateUrl: './ai-usage-summary.html',
    styleUrl: './ai-usage-summary.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsageSummary {
    readonly summary = input.required<IAiUsageSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly totalCostLabel = computed(() => formatUsd(this.summary().totalCostUsd));
    readonly totalRequestsLabel = computed(() => formatTokens(this.summary().totalRequests));
    readonly totalTokensLabel = computed(() => formatTokens(this.summary().totalTokens));
    readonly tokensBreakdownHint = computed(() => {
        const summary = this.summary();
        return `${formatTokens(summary.totalPromptTokens)} entrada · ${formatTokens(summary.totalCandidatesTokens)} saída`;
    });
    readonly avgCostLabel = computed(() => formatUsd(this.summary().avgCostPerRequestUsd));
}
