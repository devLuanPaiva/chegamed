import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { IUser } from '@features/users/models/user.model';

import { IAiUsageFilter } from '../../models/ai-usage.model';

interface AiUsageFilterForm {
    model: string;
    userId: string;
    startDate: string;
    endDate: string;
}

const EMPTY_FILTER_FORM: AiUsageFilterForm = {
    model: '',
    userId: '',
    startDate: '',
    endDate: '',
};

@Component({
    selector: 'app-ai-usage-filters',
    templateUrl: './ai-usage-filters.html',
    styleUrl: './ai-usage-filters.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsageFilters {
    readonly models = input.required<string[]>();
    readonly users = input.required<IUser[]>();

    readonly filterChange = output<IAiUsageFilter>();

    readonly form = signal<AiUsageFilterForm>({ ...EMPTY_FILTER_FORM });

    onModelChange(value: string): void {
        this.form.update((current) => ({ ...current, model: value }));
    }

    onUserChange(value: string): void {
        this.form.update((current) => ({ ...current, userId: value }));
    }

    onStartDateChange(value: string): void {
        this.form.update((current) => ({ ...current, startDate: value }));
    }

    onEndDateChange(value: string): void {
        this.form.update((current) => ({ ...current, endDate: value }));
    }

    applyFilters(event: Event): void {
        event.preventDefault();
        this.filterChange.emit(this.buildFilter());
    }

    clearFilters(): void {
        this.form.set({ ...EMPTY_FILTER_FORM });
        this.filterChange.emit({});
    }

    private buildFilter(): IAiUsageFilter {
        const form = this.form();

        return {
            model: form.model || undefined,
            userId: form.userId || undefined,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
        };
    }
}
