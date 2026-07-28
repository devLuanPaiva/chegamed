import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IAiUsageSummary } from '../../models/ai-usage.model';
import { AiUsageSummary } from './ai-usage-summary';

const SUMMARY: IAiUsageSummary = {
    totalRequests: 4,
    totalPromptTokens: 1000,
    totalCandidatesTokens: 500,
    totalTokens: 1500,
    totalCostUsd: 1.2,
    avgCostPerRequestUsd: 0.3,
    byModel: [],
    byDay: [],
};

describe('AiUsageSummary', () => {
    let fixture: ComponentFixture<AiUsageSummary>;
    let component: AiUsageSummary;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiUsageSummary],
        }).compileComponents();

        fixture = TestBed.createComponent(AiUsageSummary);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should format the total cost as USD', () => {
        expect(component.totalCostLabel()).toBe('$1.20');
    });

    it('should format the total requests with thousands separators', () => {
        expect(component.totalRequestsLabel()).toBe('4');
    });

    it('should format the total tokens with thousands separators', () => {
        expect(component.totalTokensLabel()).toBe('1.500');
    });

    it('should build a hint breaking down prompt vs candidates tokens', () => {
        expect(component.tokensBreakdownHint()).toBe('1.000 entrada · 500 saída');
    });

    it('should format the average cost per request as USD', () => {
        expect(component.avgCostLabel()).toBe('$0.30');
    });
});
