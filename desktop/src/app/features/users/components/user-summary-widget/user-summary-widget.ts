import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IUsersSummary } from '@features/dashboard/models/dashboard.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';

@Component({
    selector: 'app-user-summary-widget',
    imports: [WidgetCard, StatTile],
    templateUrl: './user-summary-widget.html',
    styleUrl: './user-summary-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSummaryWidget {
    readonly summary = input.required<IUsersSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly totalLabel = computed(() => String(this.summary().totalCount));
    readonly activeLabel = computed(() => String(this.summary().activeCount));
    readonly inactiveLabel = computed(() => String(this.summary().inactiveCount));
    readonly newThisMonthLabel = computed(() => String(this.summary().newThisMonthCount));
}
