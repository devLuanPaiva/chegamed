import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { IPrescriptionsSummary } from '@features/dashboard/models/dashboard.model';
import { DashboardService } from '@features/dashboard/services/dashboard.service';
import { NotFound } from '@shared/ui/not-found/not-found';
import { Pagination } from '@shared/ui/pagination/pagination';
import { PrescriptionStatusBadge } from '@shared/ui/prescription-status-badge/prescription-status-badge';
import { Tabs, TabConfig } from '@shared/ui/tabs/tabs';
import { extractErrorMessage } from '@shared/utils/api-error.util';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';
import { downloadBlob } from '@shared/utils/file-download.util';

import { PrescriptionCreateForm } from '../../components/prescription-create-form/prescription-create-form';
import { PrescriptionSummaryWidget } from '../../components/prescription-summary-widget/prescription-summary-widget';
import { PrescriptionFilterParams } from '../../models/prescription-api.model';
import { PrescriptionStatus, PrescriptionStatusLabels } from '../../models/prescription.model';
import { PrescriptionService } from '../../services/prescription.service';
import * as PrescriptionActions from '../../store/prescription.actions';
import {
    selectAllPrescriptions,
    selectPrescriptionsError,
    selectPrescriptionsLoading,
    selectPrescriptionsPagination,
} from '../../store/prescription.selectors';

const EMPTY_PRESCRIPTIONS_SUMMARY: IPrescriptionsSummary = {
    totalCount: 0,
    pendingCount: 0,
    canceledCount: 0,
    issuedThisMonthCount: 0,
};

interface PrescriptionListFilterForm {
    patientName: string;
    patientCpf: string;
    status: PrescriptionStatus | '';
    issueDate: string;
}

const EMPTY_FILTER_FORM: PrescriptionListFilterForm = {
    patientName: '',
    patientCpf: '',
    status: '',
    issueDate: '',
};

@Component({
    selector: 'app-prescription-list',
    imports: [
        RouterLink,
        DatePipe,
        Tabs,
        Pagination,
        PrescriptionStatusBadge,
        PrescriptionCreateForm,
        NotFound,
        PrescriptionSummaryWidget,
    ],
    templateUrl: './prescription-list.html',
    styleUrl: './prescription-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionList implements OnInit {
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);
    private readonly dashboardService = inject(DashboardService);
    private readonly prescriptionService = inject(PrescriptionService);
    private readonly toast = inject(ToastService);

    readonly prescriptions = this.store.selectSignal(selectAllPrescriptions);
    readonly loading = this.store.selectSignal(selectPrescriptionsLoading);
    readonly error = this.store.selectSignal(selectPrescriptionsError);
    readonly pagination = this.store.selectSignal(selectPrescriptionsPagination);
    readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    private readonly summaryResource = rxResource({
        params: () => (this.connectedCompanyId() ? { companyId: this.connectedCompanyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getPrescriptionsSummary(params.companyId),
        defaultValue: EMPTY_PRESCRIPTIONS_SUMMARY,
    });

    readonly summary = this.summaryResource.value;
    readonly summaryLoading = this.summaryResource.isLoading;
    readonly summaryError = computed(() => {
        const error = this.summaryResource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar os indicadores de receituários.') : null;
    });

    readonly tabs: TabConfig[] = [
        { id: 'list', label: 'Listagem' },
        { id: 'create', label: 'Cadastrar nova' },
    ];
    readonly activeTabId = signal('list');
    readonly downloadingReport = signal(false);

    readonly statusOptions = Object.values(PrescriptionStatus);
    readonly PrescriptionStatusLabels = PrescriptionStatusLabels;

    readonly filterForm = signal<PrescriptionListFilterForm>({ ...EMPTY_FILTER_FORM });

    readonly hasActiveFilters = computed(() => {
        const form = this.filterForm();
        return !!(form.patientName || form.patientCpf || form.status || form.issueDate);
    });

    readonly showNotFound = computed(
        () => !this.loading() && !this.error() && this.pagination().count === 0 && !this.hasActiveFilters(),
    );

    private readonly requestedPage = signal(0);

    constructor() {
        this.actions$
            .pipe(ofType(PrescriptionActions.createPrescriptionSuccess), takeUntilDestroyed())
            .subscribe(() => {
                this.activeTabId.set('list');
                this.loadPage(0);
            });
    }

    ngOnInit(): void {
        this.loadPage(0);
    }

    onTabChange(tabId: string): void {
        this.activeTabId.set(tabId);
    }

    downloadReport(): void {
        const companyId = this.connectedCompanyId();

        if (!companyId || this.downloadingReport()) {
            return;
        }

        this.downloadingReport.set(true);

        this.prescriptionService.downloadPrescriptionItemsReport(companyId).subscribe({
            next: ({ blob, filename }) => {
                downloadBlob(blob, filename);
                this.downloadingReport.set(false);
            },
            error: (error) => {
                this.toast.show(ToastType.Error, extractErrorMessage(error, 'Erro ao baixar relatório de receituários.'));
                this.downloadingReport.set(false);
            },
        });
    }

    onFilterPatientNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, patientName: value }));
    }

    onFilterPatientCpfChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, patientCpf: formatCpf(value) }));
    }

    onFilterStatusChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, status: value as PrescriptionStatus | '' }));
    }

    onFilterIssueDateChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, issueDate: value }));
    }

    applyFilters(event: Event): void {
        event.preventDefault();
        this.loadPage(0);
    }

    clearFilters(): void {
        this.filterForm.set({ ...EMPTY_FILTER_FORM });
        this.loadPage(0);
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

    goToPage(page: number): void {
        this.loadPage(page - 1);
    }

    private loadPage(page: number): void {
        this.requestedPage.set(page);
        this.store.dispatch(PrescriptionActions.loadPrescriptions({ page, filter: this.buildFilter() }));
    }

    private buildFilter(): PrescriptionFilterParams {
        const form = this.filterForm();

        return {
            patientName: form.patientName || undefined,
            patientCpf: form.patientCpf ? onlyDigits(form.patientCpf) : undefined,
            status: form.status || undefined,
            issueDate: form.issueDate || undefined,
        };
    }
}
