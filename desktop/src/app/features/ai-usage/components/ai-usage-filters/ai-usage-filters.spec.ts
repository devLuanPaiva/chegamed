import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserRole } from '@features/users/models/user.model';

import { AiUsageFilters } from './ai-usage-filters';

describe('AiUsageFilters', () => {
    let fixture: ComponentFixture<AiUsageFilters>;
    let component: AiUsageFilters;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiUsageFilters],
        }).compileComponents();

        fixture = TestBed.createComponent(AiUsageFilters);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('models', ['gemini-2.5-flash']);
        fixture.componentRef.setInput('users', [
            { id: 'user-1', name: 'Jane', email: 'jane@example.com', cpf: '12345678901', role: UserRole.ADMIN, createdAt: new Date(), updatedAt: new Date() },
        ]);
        fixture.detectChanges();
    });

    it('should emit undefined for every field left blank when submitted', () => {
        let emitted: unknown;
        component.filterChange.subscribe((filter) => (emitted = filter));

        component.applyFilters(new Event('submit'));

        expect(emitted).toEqual({ model: undefined, userId: undefined, startDate: undefined, endDate: undefined });
    });

    it('should emit only the fields that were filled in', () => {
        let emitted: unknown;
        component.filterChange.subscribe((filter) => (emitted = filter));

        component.onModelChange('gemini-2.5-flash');
        component.onUserChange('user-1');
        component.onStartDateChange('2026-01-01');
        component.onEndDateChange('2026-01-31');
        component.applyFilters(new Event('submit'));

        expect(emitted).toEqual({
            model: 'gemini-2.5-flash',
            userId: 'user-1',
            startDate: '2026-01-01',
            endDate: '2026-01-31',
        });
    });

    it('should reset the form and emit an empty filter when cleared', () => {
        component.onModelChange('gemini-2.5-flash');

        let emitted: unknown;
        component.filterChange.subscribe((filter) => (emitted = filter));
        component.clearFilters();

        expect(component.form().model).toBe('');
        expect(emitted).toEqual({});
    });

    it('should prevent the default form submission behavior', () => {
        const event = new Event('submit');
        let defaultPrevented = false;
        event.preventDefault = () => (defaultPrevented = true);

        component.applyFilters(event);

        expect(defaultPrevented).toBe(true);
    });
});
