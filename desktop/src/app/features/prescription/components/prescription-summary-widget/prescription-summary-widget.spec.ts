import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IPrescriptionsSummary } from '@features/dashboard/models/dashboard.model';

import { PrescriptionSummaryWidget } from './prescription-summary-widget';

const SUMMARY: IPrescriptionsSummary = {
    totalCount: 21,
    pendingCount: 7,
    canceledCount: 3,
    issuedThisMonthCount: 6,
};

describe('PrescriptionSummaryWidget', () => {
    let fixture: ComponentFixture<PrescriptionSummaryWidget>;
    let component: PrescriptionSummaryWidget;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PrescriptionSummaryWidget],
        }).compileComponents();

        fixture = TestBed.createComponent(PrescriptionSummaryWidget);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should format the total prescriptions count', () => {
        expect(component.totalLabel()).toBe('21');
    });

    it('should format the pending count', () => {
        expect(component.pendingLabel()).toBe('7');
    });

    it('should format the canceled count', () => {
        expect(component.canceledLabel()).toBe('3');
    });

    it('should format the issued-this-month count', () => {
        expect(component.issuedThisMonthLabel()).toBe('6');
    });
});
