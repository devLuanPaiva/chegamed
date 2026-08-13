import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IMedicinesSummary } from '@features/dashboard/models/dashboard.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';

@Component({
    selector: 'app-medicine-summary-widget',
    imports: [WidgetCard, StatTile],
    templateUrl: './medicine-summary-widget.html',
    styleUrl: './medicine-summary-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineSummaryWidget {
    readonly summary = input.required<IMedicinesSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly totalLabel = computed(() => String(this.summary().totalCount));
    readonly newThisMonthLabel = computed(() => String(this.summary().newThisMonthCount));
    readonly withoutEanCodeLabel = computed(() => String(this.summary().withoutEanCodeCount));
    readonly movementsThisMonthLabel = computed(() => String(this.summary().movementsThisMonthCount));
}
