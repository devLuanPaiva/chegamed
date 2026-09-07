import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { ToastType } from '@core/ui/toast/models/toast.model';
import { ToastService } from '@core/ui/toast/service/toast.service';
import { selectSelectedCompanyId } from '@features/company/store/company.selectors';
import { DashboardService } from '@features/dashboard/services/dashboard.service';
import { IPatientsSummary } from '@features/dashboard/models/dashboard.model';
import { NotFound } from '@shared/ui/not-found/not-found';
import { Pagination } from '@shared/ui/pagination/pagination';
import { Tabs, TabConfig } from '@shared/ui/tabs/tabs';
import { extractErrorMessage } from '@shared/utils/api-error.util';
import { formatCpf, onlyDigits } from '@shared/utils/cpf.util';
import { downloadBlob } from '@shared/utils/file-download.util';

import { PatientCreateModal } from '../../components/patient-create-modal/patient-create-modal';
import { PatientSummaryWidget } from '../../components/patient-summary-widget/patient-summary-widget';
import { PendingPatientList } from '../../components/pending-patient-list/pending-patient-list';
import * as PatientActions from '../../store/patient.actions';
import { PatientFilterParams } from '../../models/patient-api.model';
import { PatientService } from '../../services/patient.service';
import {
    selectAllPatients,
    selectPatientsError,
    selectPatientsLoading,
    selectPatientsPagination,
} from '../../store/patient.selectors';

const EMPTY_PATIENTS_SUMMARY: IPatientsSummary = {
    totalCount: 0,
    newThisMonthCount: 0,
    withoutAccountCount: 0,
    pendingRegistrationRequestsCount: 0,
};

interface PatientListFilterForm {
    name: string;
    cpf: string;
}

const EMPTY_FILTER_FORM: PatientListFilterForm = {
    name: '',
    cpf: '',
};

@Component({
    selector: 'app-patient-list',
    imports: [
        RouterLink,
        DatePipe,
        PatientCreateModal,
        PendingPatientList,
        Pagination,
        Tabs,
        NotFound,
        PatientSummaryWidget,
    ],
    templateUrl: './patient-list.html',
    styleUrl: './patient-list.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientList implements OnInit {
    private readonly store = inject(Store);
    private readonly dashboardService = inject(DashboardService);
    private readonly patientService = inject(PatientService);
    private readonly toast = inject(ToastService);

    readonly patients = this.store.selectSignal(selectAllPatients);
    readonly loading = this.store.selectSignal(selectPatientsLoading);
    readonly error = this.store.selectSignal(selectPatientsError);
    readonly pagination = this.store.selectSignal(selectPatientsPagination);
    readonly connectedCompanyId = this.store.selectSignal(selectSelectedCompanyId);

    private readonly summaryResource = rxResource({
        params: () => (this.connectedCompanyId() ? { companyId: this.connectedCompanyId()! } : undefined),
        stream: ({ params }) => this.dashboardService.getPatientsSummary(params.companyId),
        defaultValue: EMPTY_PATIENTS_SUMMARY,
    });

    readonly summary = this.summaryResource.value;
    readonly summaryLoading = this.summaryResource.isLoading;
    readonly summaryError = computed(() => {
        const error = this.summaryResource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar os indicadores de pacientes.') : null;
    });

    readonly tabs: TabConfig[] = [
        { id: 'list', label: 'Listagem' },
        { id: 'pending', label: 'Pendentes' },
    ];
    readonly activeTabId = signal('list');

    readonly showCreateModal = signal(false);
    readonly downloadingReport = signal(false);
    readonly filterForm = signal<PatientListFilterForm>({ ...EMPTY_FILTER_FORM });

    readonly hasActiveFilters = computed(() => {
        const form = this.filterForm();
        return !!(form.name || form.cpf);
    });

    readonly showNotFound = computed(
        () => !this.loading() && !this.error() && this.pagination().count === 0 && !this.hasActiveFilters(),
    );

    private readonly requestedPage = signal(0);

    ngOnInit(): void {
        this.loadPage(0);
    }

    onTabChange(tabId: string): void {
        this.activeTabId.set(tabId);
    }

    openCreateModal(): void {
        this.showCreateModal.set(true);
    }

    closeCreateModal(): void {
        this.showCreateModal.set(false);
    }

    downloadReport(): void {
        const companyId = this.connectedCompanyId();

        if (!companyId || this.downloadingReport()) {
            return;
        }

        this.downloadingReport.set(true);

        this.patientService.downloadPatientsReport(companyId).subscribe({
            next: ({ blob, filename }) => {
                downloadBlob(blob, filename);
                this.downloadingReport.set(false);
            },
            error: (error) => {
                this.toast.show(ToastType.Error, extractErrorMessage(error, 'Erro ao baixar relatório de pacientes.'));
                this.downloadingReport.set(false);
            },
        });
    }

    onFilterNameChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, name: value }));
    }

    onFilterCpfChange(value: string): void {
        this.filterForm.update((current) => ({ ...current, cpf: formatCpf(value) }));
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
        this.store.dispatch(PatientActions.loadPatients({ page, filter: this.buildFilter() }));
    }

    private buildFilter(): PatientFilterParams {
        const form = this.filterForm();

        return {
            name: form.name || undefined,
            cpf: form.cpf ? onlyDigits(form.cpf) : undefined,
            companyId: this.connectedCompanyId() ?? undefined,
        };
    }
}
