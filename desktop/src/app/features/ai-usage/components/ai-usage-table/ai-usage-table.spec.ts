import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { PaginationInfo } from '@shared/ui/pagination/pagination';

import { IAiUsageLog } from '../../models/ai-usage.model';
import { AiUsageTable } from './ai-usage-table';

const LOG: IAiUsageLog = {
    id: 'log-1',
    userId: 'user-1',
    userName: 'Jane Doe',
    model: 'gemini-3.5-flash',
    operationType: 'BARCODE_EXTRACTION',
    contentType: 'IMAGE',
    promptTokens: 100,
    candidatesTokens: 50,
    totalTokens: 150,
    estimatedCostUsd: 0.0015,
    createdAt: new Date(2026, 0, 5, 10, 30),
};

const PAGINATION: PaginationInfo = { currentPage: 1, totalPages: 2, next: 'next-url', previous: null };

describe('AiUsageTable', () => {
    let fixture: ComponentFixture<AiUsageTable>;
    let component: AiUsageTable;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AiUsageTable],
        }).compileComponents();

        fixture = TestBed.createComponent(AiUsageTable);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('logs', [LOG]);
        fixture.componentRef.setInput('pagination', PAGINATION);
        fixture.detectChanges();
    });

    it('should render one row per log with its formatted values', () => {
        const rows = fixture.nativeElement.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(1);
        expect(rows[0].textContent).toContain('Jane Doe');
        expect(rows[0].textContent).toContain('gemini-3.5-flash');
        expect(rows[0].textContent).toContain('Imagem');
        expect(rows[0].textContent).toContain('Leitura de código de barras');
        expect(rows[0].textContent).toContain('$0.0015');
    });

    it('should render an empty-state row when there are no logs', () => {
        fixture.componentRef.setInput('logs', []);
        fixture.detectChanges();

        const rows = fixture.nativeElement.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(1);
        expect(rows[0].textContent).toContain('Nenhum registro de uso encontrado');
    });

    it('should emit previousPage and nextPage when requested', () => {
        let previousEmitted = 0;
        let nextEmitted = 0;
        component.previousPage.subscribe(() => previousEmitted++);
        component.nextPage.subscribe(() => nextEmitted++);

        component.previousPage.emit();
        component.nextPage.emit();

        expect(previousEmitted).toBe(1);
        expect(nextEmitted).toBe(1);
    });

    it('should show the loading state instead of the table when loading', () => {
        fixture.componentRef.setInput('loading', true);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('table')).toBeNull();
        expect(fixture.nativeElement.querySelector('.spinner')).not.toBeNull();
    });

    it('should show the error state with a retry button when an error is set', () => {
        fixture.componentRef.setInput('error', 'Erro ao carregar');
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Erro ao carregar');

        let retried = 0;
        component.retry.subscribe(() => retried++);
        fixture.nativeElement.querySelector('button').click();

        expect(retried).toBe(1);
    });
});
