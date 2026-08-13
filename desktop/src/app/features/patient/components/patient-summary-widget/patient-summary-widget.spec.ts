import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IPatientsSummary } from '@features/dashboard/models/dashboard.model';

import { PatientSummaryWidget } from './patient-summary-widget';

const SUMMARY: IPatientsSummary = {
    totalCount: 50,
    newThisMonthCount: 4,
    withoutAccountCount: 12,
    pendingRegistrationRequestsCount: 3,
};

describe('PatientSummaryWidget', () => {
    let fixture: ComponentFixture<PatientSummaryWidget>;
    let component: PatientSummaryWidget;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PatientSummaryWidget],
        }).compileComponents();

        fixture = TestBed.createComponent(PatientSummaryWidget);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should format the total patients count', () => {
        expect(component.totalLabel()).toBe('50');
    });

    it('should format the new-this-month count', () => {
        expect(component.newThisMonthLabel()).toBe('4');
    });

    it('should format the without-account count', () => {
        expect(component.withoutAccountLabel()).toBe('12');
    });

    it('should format the pending registration requests count', () => {
        expect(component.pendingRegistrationRequestsLabel()).toBe('3');
    });
});
