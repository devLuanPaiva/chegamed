import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    AiUsageLogApiDto,
    AiUsageLogFilterParams,
    AiUsageLogsPage,
    AiUsageSummaryApiDto,
    toAiUsageLog,
    toAiUsageSummary,
} from '../models/ai-usage-api.model';
import { IAiUsageFilter, IAiUsageSummary } from '../models/ai-usage.model';

const DEFAULT_PAGE_SIZE = 20;

function buildFilterParams(filter?: IAiUsageFilter): AiUsageLogFilterParams {
    if (!filter) {
        return {};
    }

    const params: AiUsageLogFilterParams = {};

    if (filter.model) params.model = filter.model;
    if (filter.userId) params.userId = filter.userId;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;

    return params;
}

@Injectable({
    providedIn: 'root',
})
export class AiUsageService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getLogs(page = 0, filter?: IAiUsageFilter, size = DEFAULT_PAGE_SIZE): Observable<AiUsageLogsPage> {
        return this.http
            .get<ApiResponse<AiUsageLogApiDto[]>>(`${this.apiUrl()}/ai/usage/logs`, {
                params: { page, size, ...buildFilterParams(filter) },
            })
            .pipe(
                map((response) => ({
                    logs: response.data.map(toAiUsageLog),
                    count: response.count ?? response.data.length,
                    currentPage: response.currentPage ?? 1,
                    totalPages: response.totalPages ?? 1,
                    next: response.next,
                    previous: response.previous,
                })),
            );
    }

    getSummary(filter?: IAiUsageFilter): Observable<IAiUsageSummary> {
        return this.http
            .get<ApiResponse<AiUsageSummaryApiDto>>(`${this.apiUrl()}/ai/usage/summary`, {
                params: { ...buildFilterParams(filter) },
            })
            .pipe(map((response) => toAiUsageSummary(response.data)));
    }

    getModels(): Observable<string[]> {
        return this.http
            .get<ApiResponse<string[]>>(`${this.apiUrl()}/ai/usage/models`)
            .pipe(map((response) => response.data));
    }
}
