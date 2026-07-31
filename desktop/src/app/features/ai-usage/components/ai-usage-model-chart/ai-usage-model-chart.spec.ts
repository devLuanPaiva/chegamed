import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IAiUsageSummary } from '../../models/ai-usage.model';
import { AiUsageModelChart } from './ai-usage-model-chart';

const SUMMARY: IAiUsageSummary = {
    totalRequests: 5,
    totalPromptTokens: 500,
    totalCandidatesTokens: 250,
    totalTokens: 750,
    totalCostUsd: 1.5,
    avgCostPerRequestUsd: 0.3,
    byModel: [
        { model: 'gemini-2.5-pro', requests: 3, totalTokens: 450, costUsd: 1.0 },
        { model: 'gemini-3.1-flash-lite', requests: 2, totalTokens: 300, costUsd: 0.5 },
    ],
    byDay: [],
};

describe('AiUsageModelChart', () => {
    let fixture: ComponentFixture<AiUsageModelChart>;
    let component: AiUsageModelChart;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiUsageModelChart],
        }).compileComponents();

        fixture = TestBed.createComponent(AiUsageModelChart);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should build one label per model and a single cost dataset in the same order', () => {
        const chartData = component.chartData();

        expect(chartData.labels).toEqual(['gemini-2.5-pro', 'gemini-3.1-flash-lite']);
        expect(chartData.datasets).toHaveLength(1);
        expect(chartData.datasets[0].data).toEqual([1.0, 0.5]);
    });

    it('should assign one background color per model', () => {
        const chartData = component.chartData();
        const colors = chartData.datasets[0].backgroundColor as string[];

        expect(colors).toHaveLength(2);
        expect(colors[0]).not.toBe(colors[1]);
    });
});
