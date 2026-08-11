import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IDeliveriesSummary } from '@features/dashboard/models/dashboard.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';

@Component({
    selector: 'app-delivery-summary-widget',
    imports: [WidgetCard, StatTile],
    templateUrl: './delivery-summary-widget.html',
    styleUrl: './delivery-summary-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliverySummaryWidget {
    readonly summary = input.required<IDeliveriesSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly totalLabel = computed(() => String(this.summary().totalCount));
    readonly thisMonthLabel = computed(() => String(this.summary().thisMonthCount));
    readonly overdueLabel = computed(() => String(this.summary().overdueCount));
    readonly upcomingLabel = computed(() => String(this.summary().upcomingCount));
}
