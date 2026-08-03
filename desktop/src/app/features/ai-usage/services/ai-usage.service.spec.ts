import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import { AiUsageLogApiDto, AiUsageSummaryApiDto } from '../models/ai-usage-api.model';
import { IAiUsageLog, IAiUsageSummary } from '../models/ai-usage.model';
import { AiUsageService } from './ai-usage.service';

const API_URL = environment.api_url;

function buildLogDto(overrides: Partial<AiUsageLogApiDto> = {}): AiUsageLogApiDto {
    return {
        id: 'log-1',
        userId: 'user-1',
        userName: 'Jane Doe',
        model: 'gemini-3.5-flash',
        operationType: 'BARCODE_EXTRACTION',
        contentType: 'IMAGE',
        promptTokens: 100,
        candidatesTokens: 50,
        totalTokens: 150,
        estimatedCostUsd: 0.0015,
        createdAt: '2026-01-01T10:00:00Z',
        ...overrides,
    };
}

function buildSummaryDto(overrides: Partial<AiUsageSummaryApiDto> = {}): AiUsageSummaryApiDto {
    return {
        totalRequests: 4,
        totalPromptTokens: 400,
        totalCandidatesTokens: 200,
        totalTokens: 600,
        totalCostUsd: 1.2,
        avgCostPerRequestUsd: 0.3,
        byModel: [{ model: 'gemini-3.5-flash', requests: 4, totalTokens: 600, costUsd: 1.2 }],
        byDay: [{ date: '2026-01-01', requests: 4, totalTokens: 600, costUsd: 1.2 }],
        ...overrides,
    };
}

function buildResponse<T>(data: T, overrides: Partial<ApiResponse<T>> = {}): ApiResponse<T> {
    return {
        success: true,
        message: 'ok',
        count: null,
        currentPage: 1,
        totalPages: 1,
        next: null,
        previous: null,
        data,
        ...overrides,
    };
}

describe('AiUsageService', () => {
    let service: AiUsageService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), AiUsageService],
        });

        service = TestBed.inject(AiUsageService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getLogs', () => {
        it('should send page/size and only the filter params that are set', () => {
            let result: unknown;

            service.getLogs(1, { model: 'gemini-3.5-flash', userId: undefined, startDate: '2026-01-01' })
                .subscribe((page) => (result = page));

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${API_URL}/ai/usage/logs` &&
                    request.params.get('page') === '1' &&
                    request.params.get('size') === '20' &&
                    request.params.get('model') === 'gemini-3.5-flash' &&
                    request.params.get('startDate') === '2026-01-01' &&
                    !request.params.has('userId') &&
                    !request.params.has('endDate'),
            );
            req.flush(buildResponse([buildLogDto()], { count: 1, currentPage: 2, totalPages: 3, next: 'next-url' }));

            expect(result).toEqual({
                logs: [
                    {
                        ...buildLogDto(),
                        createdAt: new Date('2026-01-01T10:00:00Z'),
                    } satisfies IAiUsageLog,
                ],
                count: 1,
                currentPage: 2,
                totalPages: 3,
                next: 'next-url',
                previous: null,
            });
        });

        it('should default to page 0 and size 20 with no filter params when none are provided', () => {
            service.getLogs().subscribe();

            httpMock.expectOne(
                (request) =>
                    request.url === `${API_URL}/ai/usage/logs` &&
                    request.params.get('page') === '0' &&
                    request.params.get('size') === '20' &&
                    !request.params.has('model') &&
                    !request.params.has('userId') &&
                    !request.params.has('startDate') &&
                    !request.params.has('endDate'),
            ).flush(buildResponse([]));
        });
    });

    describe('getSummary', () => {
        it('should map the response into an IAiUsageSummary with parsed breakdown dates', () => {
            let result: IAiUsageSummary | undefined;

            service.getSummary({ userId: 'user-1' }).subscribe((summary) => (result = summary));

            const req = httpMock.expectOne(
                (request) => request.url === `${API_URL}/ai/usage/summary` && request.params.get('userId') === 'user-1',
            );
            req.flush(buildResponse(buildSummaryDto()));

            expect(result).toEqual({
                totalRequests: 4,
                totalPromptTokens: 400,
                totalCandidatesTokens: 200,
                totalTokens: 600,
                totalCostUsd: 1.2,
                avgCostPerRequestUsd: 0.3,
                byModel: [{ model: 'gemini-3.5-flash', requests: 4, totalTokens: 600, costUsd: 1.2 }],
                byDay: [{ date: new Date(2026, 0, 1), requests: 4, totalTokens: 600, costUsd: 1.2 }],
            });
        });
    });

    describe('getModels', () => {
        it('should return the list of distinct models from the response data', () => {
            let result: string[] | undefined;

            service.getModels().subscribe((models) => (result = models));

            const req = httpMock.expectOne(`${API_URL}/ai/usage/models`);
            req.flush(buildResponse(['gemini-3.5-flash', 'gemini-3.1-flash-lite']));

            expect(result).toEqual(['gemini-3.5-flash', 'gemini-3.1-flash-lite']);
        });
    });
});
