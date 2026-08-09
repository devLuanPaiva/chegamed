import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';

import { ConfirmDialog } from '@shared/ui/confirm-dialog/confirm-dialog';
import { NotFound } from '@shared/ui/not-found/not-found';
import { Pagination } from '@shared/ui/pagination/pagination';

import { IPatientRegistrationRequest } from '../../models/patient.model';
import * as PatientActions from '../../store/patient.actions';
import {
    selectPendingRegistrationRequests,
    selectPendingRegistrationRequestsError,
    selectPendingRegistrationRequestsLoading,
    selectPendingRegistrationRequestsPagination,
    selectReviewingRequestId,
} from '../../store/patient.selectors';

interface ConfirmTarget {
    id: string;
    name: string;
    kind: 'approve' | 'reject';
}

@Component({
    selector: 'app-pending-patient-list',
    imports: [DatePipe, ConfirmDialog, NotFound, Pagination],
    templateUrl: './pending-patient-list.html',
    styleUrl: './pending-patient-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingPatientList implements OnInit {
    private readonly store = inject(Store);

    readonly requests = this.store.selectSignal(selectPendingRegistrationRequests);
    readonly loading = this.store.selectSignal(selectPendingRegistrationRequestsLoading);
    readonly error = this.store.selectSignal(selectPendingRegistrationRequestsError);
    readonly pagination = this.store.selectSignal(selectPendingRegistrationRequestsPagination);
    readonly reviewingRequestId = this.store.selectSignal(selectReviewingRequestId);

    readonly showNotFound = computed(() => !this.loading() && !this.error() && this.pagination().count === 0);

    readonly confirmTarget = signal<ConfirmTarget | null>(null);

    private readonly requestedPage = signal(0);

    ngOnInit(): void {
        this.loadPage(0);
    }

    openApproveConfirm(request: IPatientRegistrationRequest): void {
        this.confirmTarget.set({ id: request.id, name: request.name, kind: 'approve' });
    }

    openRejectConfirm(request: IPatientRegistrationRequest): void {
        this.confirmTarget.set({ id: request.id, name: request.name, kind: 'reject' });
    }

    onConfirmClosed(): void {
        this.confirmTarget.set(null);
    }

    confirmAction(): void {
        const target = this.confirmTarget();

        if (!target) {
            return;
        }

        if (target.kind === 'approve') {
            this.store.dispatch(PatientActions.approveRegistrationRequest({ id: target.id }));
        } else {
            this.store.dispatch(PatientActions.rejectRegistrationRequest({ id: target.id }));
        }
    }

    retry(): void {
        this.loadPage(this.requestedPage());
    }

    goToPreviousPage(): void {
        if (this.pagination().previous) {
            this.loadPage(this.requestedPage() - 1);
        }
    }

    goToNextPage(): void {
        if (this.pagination().next) {
            this.loadPage(this.requestedPage() + 1);
        }
    }

    private loadPage(page: number): void {
        this.requestedPage.set(page);
        this.store.dispatch(PatientActions.loadPendingRegistrationRequests({ page }));
    }
}
