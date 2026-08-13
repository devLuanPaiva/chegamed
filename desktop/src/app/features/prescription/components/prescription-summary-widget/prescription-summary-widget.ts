import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IPrescriptionsSummary } from '@features/dashboard/models/dashboard.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';

@Component({
    selector: 'app-prescription-summary-widget',
    imports: [WidgetCard, StatTile],
    templateUrl: './prescription-summary-widget.html',
    styleUrl: './prescription-summary-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionSummaryWidget {
    readonly summary = input.required<IPrescriptionsSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly totalLabel = computed(() => String(this.summary().totalCount));
    readonly pendingLabel = computed(() => String(this.summary().pendingCount));
    readonly canceledLabel = computed(() => String(this.summary().canceledCount));
    readonly issuedThisMonthLabel = computed(() => String(this.summary().issuedThisMonthCount));
}
