import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IAiUsageSummary } from '../../models/ai-usage.model';
import { AiUsageCostChart } from './ai-usage-cost-chart';

const SUMMARY: IAiUsageSummary = {
    totalRequests: 3,
    totalPromptTokens: 300,
    totalCandidatesTokens: 150,
    totalTokens: 450,
    totalCostUsd: 0.9,
    avgCostPerRequestUsd: 0.3,
    byModel: [],
    byDay: [
        { date: new Date(2026, 0, 1), requests: 2, totalTokens: 300, costUsd: 0.6 },
        { date: new Date(2026, 0, 2), requests: 1, totalTokens: 150, costUsd: 0.3 },
    ],
};

describe('AiUsageCostChart', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiUsageCostChart],
        }).compileComponents();
    });

    function createComponent(summary: IAiUsageSummary): AiUsageCostChart {
        const fixture: ComponentFixture<AiUsageCostChart> = TestBed.createComponent(AiUsageCostChart);
        fixture.componentRef.setInput('summary', summary);
        fixture.detectChanges();
        return fixture.componentInstance;
    }

    it('should build one label per day and a single cost dataset in the same order', () => {
        const chartData = createComponent(SUMMARY).chartData();

        expect(chartData.labels).toEqual(['01/01', '02/01']);
        expect(chartData.datasets).toHaveLength(1);
        expect(chartData.datasets[0].data).toEqual([0.6, 0.3]);
    });

    it('should render an empty chart when there is no daily breakdown', () => {
        const chartData = createComponent({ ...SUMMARY, byDay: [] }).chartData();

        expect(chartData.labels).toEqual([]);
        expect(chartData.datasets[0].data).toEqual([]);
    });
});
