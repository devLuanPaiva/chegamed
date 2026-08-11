import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IUsersSummary } from '@features/dashboard/models/dashboard.model';

import { UserSummaryWidget } from './user-summary-widget';

const SUMMARY: IUsersSummary = {
    totalCount: 30,
    activeCount: 27,
    inactiveCount: 3,
    newThisMonthCount: 2,
};

describe('UserSummaryWidget', () => {
    let fixture: ComponentFixture<UserSummaryWidget>;
    let component: UserSummaryWidget;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UserSummaryWidget],
        }).compileComponents();

        fixture = TestBed.createComponent(UserSummaryWidget);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('summary', SUMMARY);
        fixture.detectChanges();
    });

    it('should format the total users count', () => {
        expect(component.totalLabel()).toBe('30');
    });

    it('should format the active count', () => {
        expect(component.activeLabel()).toBe('27');
    });

    it('should format the inactive count', () => {
        expect(component.inactiveLabel()).toBe('3');
    });

    it('should format the new-this-month count', () => {
        expect(component.newThisMonthLabel()).toBe('2');
    });
});
