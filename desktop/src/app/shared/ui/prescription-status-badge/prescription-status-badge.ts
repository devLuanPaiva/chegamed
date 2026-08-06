import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PrescriptionStatus, PrescriptionStatusLabels } from '@features/prescription/models/prescription.model';

const STATUS_BADGE_CLASS: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: 'badge-warning',
    [PrescriptionStatus.OUT_FOR_DELIVERY]: 'badge-success',
    [PrescriptionStatus.DELIVERED]: 'badge-primary',
    [PrescriptionStatus.PARTIAL_DELIVERED]: 'badge-outline',
    [PrescriptionStatus.CANCELED]: 'badge-danger',
};

@Component({
    selector: 'app-prescription-status-badge',
    template: `<span class="badge" [class]="badgeClass()">{{ label() }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionStatusBadge {
    readonly status = input.required<PrescriptionStatus>();

    readonly label = computed(() => PrescriptionStatusLabels[this.status()]);
    readonly badgeClass = computed(() => STATUS_BADGE_CLASS[this.status()]);
}
