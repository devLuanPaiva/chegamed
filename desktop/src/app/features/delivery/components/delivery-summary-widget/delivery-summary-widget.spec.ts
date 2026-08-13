import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IDeliveriesSummary } from '@features/dashboard/models/dashboard.model';

import { DeliverySummaryWidget } from './delivery-summary-widget';

const SUMMARY: IDeliveriesSummary = {
    totalCount: 120,
    thisMonthCount: 9,
    overdueCount: 2,
    upcomingCount: 1,
};

describe('DeliverySummaryWidget', () => {
    let fixture: ComponentFixture<DeliverySummaryWidget>;
    let component: DeliverySummaryWidget;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DeliverySummaryWidget],
        }).compileComponents();

        fixture = TestBed.createComponent(DeliverySummaryWidget);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should format the total deliveries count', () => {
        expect(component.totalLabel()).toBe('120');
    });

    it('should format the this-month count', () => {
        expect(component.thisMonthLabel()).toBe('9');
    });

    it('should format the overdue count', () => {
        expect(component.overdueLabel()).toBe('2');
    });

    it('should format the upcoming count', () => {
        expect(component.upcomingLabel()).toBe('1');
    });
});
