import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { Pagination, PaginationInfo } from './pagination';

function setPagination(fixture: ComponentFixture<Pagination>, pagination: PaginationInfo): void {
    fixture.componentRef.setInput('pagination', pagination);
    fixture.detectChanges();
}

function pageButtons(fixture: ComponentFixture<Pagination>): HTMLButtonElement[] {
    return fixture.debugElement
        .queryAll(By.css('.pagination__page-btn'))
        .map((debugElement) => debugElement.nativeElement as HTMLButtonElement);
}

describe('Pagination', () => {
    let fixture: ComponentFixture<Pagination>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Pagination],
        }).compileComponents();

        fixture = TestBed.createComponent(Pagination);
    });

    it('should render a numbered button for each page in the window', () => {
        setPagination(fixture, { currentPage: 1, totalPages: 3, next: null, previous: null });

        const buttons = pageButtons(fixture);

        expect(buttons.map((button) => button.textContent?.trim())).toEqual(['1', '2', '3']);
    });

    it('should mark the current page button as active with aria-current', () => {
        setPagination(fixture, { currentPage: 2, totalPages: 3, next: null, previous: null });

        const buttons = pageButtons(fixture);
        const activeButton = buttons.find((button) => button.textContent?.trim() === '2');
        const otherButton = buttons.find((button) => button.textContent?.trim() === '1');

        expect(activeButton?.getAttribute('aria-current')).toBe('page');
        expect(otherButton?.getAttribute('aria-current')).toBeNull();
    });

    it('should emit pageSelected with the clicked page number', () => {
        setPagination(fixture, { currentPage: 1, totalPages: 3, next: null, previous: null });

        let emitted: number | undefined;
        fixture.componentInstance.pageSelected.subscribe((page) => (emitted = page));

        const buttons = pageButtons(fixture);
        buttons.find((button) => button.textContent?.trim() === '3')?.click();

        expect(emitted).toBe(3);
    });

    it('should disable the previous button when there is no previous page', () => {
        setPagination(fixture, { currentPage: 1, totalPages: 3, next: 'next-url', previous: null });

        const previousButton = fixture.debugElement.query(By.css('[aria-label="Página anterior"]'))
            .nativeElement as HTMLButtonElement;

        expect(previousButton.disabled).toBe(true);
    });

    it('should disable the next button when there is no next page', () => {
        setPagination(fixture, { currentPage: 3, totalPages: 3, next: null, previous: 'previous-url' });

        const nextButton = fixture.debugElement.query(By.css('[aria-label="Próxima página"]'))
            .nativeElement as HTMLButtonElement;

        expect(nextButton.disabled).toBe(true);
    });

    it('should emit previousPage and nextPage when their buttons are clicked', () => {
        setPagination(fixture, { currentPage: 2, totalPages: 3, next: 'next-url', previous: 'previous-url' });

        let previousEmitted = false;
        let nextEmitted = false;
        fixture.componentInstance.previousPage.subscribe(() => (previousEmitted = true));
        fixture.componentInstance.nextPage.subscribe(() => (nextEmitted = true));

        (fixture.debugElement.query(By.css('[aria-label="Página anterior"]')).nativeElement as HTMLButtonElement).click();
        (fixture.debugElement.query(By.css('[aria-label="Próxima página"]')).nativeElement as HTMLButtonElement).click();

        expect(previousEmitted).toBe(true);
        expect(nextEmitted).toBe(true);
    });
});
