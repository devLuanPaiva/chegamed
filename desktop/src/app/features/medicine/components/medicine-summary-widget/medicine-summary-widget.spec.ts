import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IMedicinesSummary } from '@features/dashboard/models/dashboard.model';

import { MedicineSummaryWidget } from './medicine-summary-widget';

const SUMMARY: IMedicinesSummary = {
    totalCount: 80,
    newThisMonthCount: 6,
    withoutEanCodeCount: 14,
    movementsThisMonthCount: 25,
};

describe('MedicineSummaryWidget', () => {
    let fixture: ComponentFixture<MedicineSummaryWidget>;
    let component: MedicineSummaryWidget;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MedicineSummaryWidget],
        }).compileComponents();

        fixture = TestBed.createComponent(MedicineSummaryWidget);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should format the total medicines count', () => {
        expect(component.totalLabel()).toBe('80');
    });

    it('should format the new-this-month count', () => {
        expect(component.newThisMonthLabel()).toBe('6');
    });

    it('should format the without-EAN-code count', () => {
        expect(component.withoutEanCodeLabel()).toBe('14');
    });

    it('should format the movements-this-month count', () => {
        expect(component.movementsThisMonthLabel()).toBe('25');
    });
});
