import { parseFortalezaDateTime, parseLocalDate } from '@shared/utils/date.util';

import {
    AiContentType,
    AiOperationType,
    IAiUsageDailyBreakdown,
    IAiUsageLog,
    IAiUsageModelBreakdown,
    IAiUsageSummary,
} from './ai-usage.model';

export interface AiUsageLogApiDto {
    id: string;
    userId: string;
    userName: string;
    model: string;
    operationType: AiOperationType;
    contentType: AiContentType;
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    createdAt: string;
}

export interface AiUsageModelBreakdownApiDto {
    model: string;
    requests: number;
    totalTokens: number;
    costUsd: number;
}

export interface AiUsageDailyBreakdownApiDto {
    date: string;
    requests: number;
    totalTokens: number;
    costUsd: number;
}

export interface AiUsageSummaryApiDto {
    totalRequests: number;
    totalPromptTokens: number;
    totalCandidatesTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    avgCostPerRequestUsd: number;
    byModel: AiUsageModelBreakdownApiDto[];
    byDay: AiUsageDailyBreakdownApiDto[];
}

export interface AiUsageLogFilterParams {
    model?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}

export interface AiUsageLogsPage {
    logs: IAiUsageLog[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toAiUsageLog(dto: AiUsageLogApiDto): IAiUsageLog {
    return {
        ...dto,
        createdAt: parseFortalezaDateTime(dto.createdAt),
    };
}

export function toAiUsageModelBreakdown(dto: AiUsageModelBreakdownApiDto): IAiUsageModelBreakdown {
    return { ...dto };
}

export function toAiUsageDailyBreakdown(dto: AiUsageDailyBreakdownApiDto): IAiUsageDailyBreakdown {
    return {
        ...dto,
        date: parseLocalDate(dto.date),
    };
}

export function toAiUsageSummary(dto: AiUsageSummaryApiDto): IAiUsageSummary {
    return {
        totalRequests: dto.totalRequests,
        totalPromptTokens: dto.totalPromptTokens,
        totalCandidatesTokens: dto.totalCandidatesTokens,
        totalTokens: dto.totalTokens,
        totalCostUsd: dto.totalCostUsd,
        avgCostPerRequestUsd: dto.avgCostPerRequestUsd,
        byModel: dto.byModel.map(toAiUsageModelBreakdown),
        byDay: dto.byDay.map(toAiUsageDailyBreakdown),
    };
}
