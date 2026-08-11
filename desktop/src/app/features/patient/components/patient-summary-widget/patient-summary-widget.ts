import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IPatientsSummary } from '@features/dashboard/models/dashboard.model';
import { StatTile } from '@shared/ui/stat-tile/stat-tile';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';

@Component({
    selector: 'app-patient-summary-widget',
    imports: [WidgetCard, StatTile],
    templateUrl: './patient-summary-widget.html',
    styleUrl: './patient-summary-widget.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientSummaryWidget {
    readonly summary = input.required<IPatientsSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly totalLabel = computed(() => String(this.summary().totalCount));
    readonly newThisMonthLabel = computed(() => String(this.summary().newThisMonthCount));
    readonly withoutAccountLabel = computed(() => String(this.summary().withoutAccountCount));
    readonly pendingRegistrationRequestsLabel = computed(() =>
        String(this.summary().pendingRegistrationRequestsCount),
    );
}
