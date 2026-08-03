import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { UserService } from '@features/users/services/user.service';

import { AiUsageCostChart } from '../../components/ai-usage-cost-chart/ai-usage-cost-chart';
import { AiUsageModelChart } from '../../components/ai-usage-model-chart/ai-usage-model-chart';
import { AiUsageLogsPage } from '../../models/ai-usage-api.model';
import { IAiUsageFilter, IAiUsageSummary } from '../../models/ai-usage.model';
import { AiUsageService } from '../../services/ai-usage.service';
import { AiUsagePage } from './ai-usage-page';

/**
 * jsdom has no real canvas backend, so Chart.js throws once an already-created chart
 * receives a data update (only the first render is guarded by Chart.js itself). The
 * chart components have their own dedicated specs, so here they're stubbed out to keep
 * this suite focused on the page's filter/pagination/resource wiring.
 */
function stubChartWidgets(): void {
    TestBed.overrideComponent(AiUsageCostChart, { set: { template: '', imports: [] } });
    TestBed.overrideComponent(AiUsageModelChart, { set: { template: '', imports: [] } });
}

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

function buildLogsPage(overrides: Partial<AiUsageLogsPage> = {}): AiUsageLogsPage {
    return {
        logs: [],
        count: 0,
        currentPage: 1,
        totalPages: 1,
        next: null,
        previous: null,
        ...overrides,
    };
}

describe('AiUsagePage', () => {
    let fixture: ComponentFixture<AiUsagePage>;
    let component: AiUsagePage;
    let aiUsageService: {
        getModels: ReturnType<typeof vi.fn>;
        getSummary: ReturnType<typeof vi.fn>;
        getLogs: ReturnType<typeof vi.fn>;
    };
    let userService: { getAllUsers: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        aiUsageService = {
            getModels: vi.fn(() => of(['gemini-3.5-flash'])),
            getSummary: vi.fn(() => of(EMPTY_SUMMARY)),
            getLogs: vi.fn(() => of(buildLogsPage())),
        };
        userService = { getAllUsers: vi.fn(() => of([])) };

        TestBed.configureTestingModule({
            imports: [AiUsagePage],
            providers: [
                { provide: AiUsageService, useValue: aiUsageService },
                { provide: UserService, useValue: userService },
            ],
        });
        stubChartWidgets();
        await TestBed.compileComponents();

        fixture = TestBed.createComponent(AiUsagePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should load models, users, summary and logs on init', () => {
        expect(aiUsageService.getModels).toHaveBeenCalled();
        expect(userService.getAllUsers).toHaveBeenCalled();
        expect(aiUsageService.getSummary).toHaveBeenCalledWith({});
        expect(aiUsageService.getLogs).toHaveBeenCalledWith(0, {});
        expect(component.models()).toEqual(['gemini-3.5-flash']);
    });

    it('should reset the requested page and refetch when the filter changes', async () => {
        component.requestedPage.set(2);

        const filter: IAiUsageFilter = { model: 'gemini-3.5-flash' };
        component.onFilterChange(filter);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.requestedPage()).toBe(0);
        expect(aiUsageService.getLogs).toHaveBeenCalledWith(0, filter);
        expect(aiUsageService.getSummary).toHaveBeenCalledWith(filter);
    });

    it('should advance to the next page only when pagination.next is set', async () => {
        aiUsageService.getLogs.mockReturnValue(of(buildLogsPage({ currentPage: 1, totalPages: 2, next: 'next-url' })));
        component.onFilterChange({});
        fixture.detectChanges();
        await fixture.whenStable();

        component.goToNextPage();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.requestedPage()).toBe(1);
        expect(aiUsageService.getLogs).toHaveBeenCalledWith(1, {});
    });

    it('should not advance to the next page when pagination.next is null', async () => {
        component.goToNextPage();

        expect(component.requestedPage()).toBe(0);
    });

    it('should not go to the previous page when pagination.previous is null', async () => {
        component.goToPreviousPage();

        expect(component.requestedPage()).toBe(0);
    });
});
