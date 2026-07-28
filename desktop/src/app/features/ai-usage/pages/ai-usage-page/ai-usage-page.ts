import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { UserService } from '@features/users/services/user.service';
import { PaginationInfo } from '@shared/ui/pagination/pagination';
import { extractErrorMessage } from '@shared/utils/api-error.util';

import { AiUsageCostChart } from '../../components/ai-usage-cost-chart/ai-usage-cost-chart';
import { AiUsageFilters } from '../../components/ai-usage-filters/ai-usage-filters';
import { AiUsageModelChart } from '../../components/ai-usage-model-chart/ai-usage-model-chart';
import { AiUsageSummary } from '../../components/ai-usage-summary/ai-usage-summary';
import { AiUsageTable } from '../../components/ai-usage-table/ai-usage-table';
import { IAiUsageFilter, IAiUsageSummary } from '../../models/ai-usage.model';
import { AiUsageService } from '../../services/ai-usage.service';

const EMPTY_SUMMARY: IAiUsageSummary = {
    totalRequests: 0,
    totalPromptTokens: 0,
    totalCandidatesTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    avgCostPerRequestUsd: 0,
    byModel: [],
    byDay: [],
};

@Component({
    selector: 'app-ai-usage-page',
    imports: [AiUsageFilters, AiUsageSummary, AiUsageCostChart, AiUsageModelChart, AiUsageTable],
    templateUrl: './ai-usage-page.html',
    styleUrl: './ai-usage-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsagePage {
    private readonly aiUsageService = inject(AiUsageService);
    private readonly userService = inject(UserService);

    readonly filter = signal<IAiUsageFilter>({});
    readonly requestedPage = signal(0);

    private readonly modelsResource = rxResource({
        stream: () => this.aiUsageService.getModels(),
        defaultValue: [] as string[],
    });

    private readonly usersResource = rxResource({
        stream: () => this.userService.getAllUsers(),
        defaultValue: [],
    });

    readonly models = this.modelsResource.value;
    readonly users = this.usersResource.value;

    private readonly summaryResource = rxResource({
        params: () => ({ filter: this.filter() }),
        stream: ({ params }) => this.aiUsageService.getSummary(params.filter),
        defaultValue: EMPTY_SUMMARY,
    });

    readonly summary = this.summaryResource.value;
    readonly summaryLoading = this.summaryResource.isLoading;
    readonly summaryError = computed(() => {
        const error = this.summaryResource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar os indicadores de uso da IA.') : null;
    });

    private readonly logsResource = rxResource({
        params: () => ({ filter: this.filter(), page: this.requestedPage() }),
        stream: ({ params }) => this.aiUsageService.getLogs(params.page, params.filter),
    });

    readonly logs = computed(() => this.logsResource.value()?.logs ?? []);
    readonly logsLoading = this.logsResource.isLoading;
    readonly logsError = computed(() => {
        const error = this.logsResource.error();
        return error ? extractErrorMessage(error, 'Erro ao carregar o uso da IA.') : null;
    });

    readonly pagination = computed<PaginationInfo>(() => {
        const page = this.logsResource.value();

        return {
            currentPage: page?.currentPage ?? 1,
            totalPages: page?.totalPages ?? 1,
            next: page?.next ?? null,
            previous: page?.previous ?? null,
        };
    });

    onFilterChange(filter: IAiUsageFilter): void {
        this.filter.set(filter);
        this.requestedPage.set(0);
    }

    retry(): void {
        this.summaryResource.reload();
        this.logsResource.reload();
    }

    goToPreviousPage(): void {
        if (this.pagination().previous) {
            this.requestedPage.update((page) => page - 1);
        }
    }

    goToNextPage(): void {
        if (this.pagination().next) {
            this.requestedPage.update((page) => page + 1);
        }
    }
}
