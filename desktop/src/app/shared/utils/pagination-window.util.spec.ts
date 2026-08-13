import { describe, expect, it } from 'vitest';

import { buildPageWindow } from './pagination-window.util';

describe('pagination-window.util', () => {
    describe('buildPageWindow', () => {
        it('should return an empty array when there are no pages', () => {
            expect(buildPageWindow(1, 0)).toEqual([]);
        });

        it('should return a single page when there is only one page', () => {
            expect(buildPageWindow(1, 1)).toEqual([1]);
        });

        it('should return all pages when the total is within the visible window', () => {
            expect(buildPageWindow(2, 3)).toEqual([1, 2, 3]);
        });

        it('should start the window at page 1 when the current page is near the start', () => {
            expect(buildPageWindow(1, 10)).toEqual([1, 2, 3, 4, 5]);
        });

        it('should center the window around the current page when it is in the middle', () => {
            expect(buildPageWindow(5, 10)).toEqual([3, 4, 5, 6, 7]);
        });

        it('should end the window at the last page when the current page is near the end', () => {
            expect(buildPageWindow(10, 10)).toEqual([6, 7, 8, 9, 10]);
        });

        it('should keep the window within bounds when the current page is one past the start clamp', () => {
            expect(buildPageWindow(2, 10)).toEqual([1, 2, 3, 4, 5]);
        });

        it('should keep the window within bounds when the current page is one before the end clamp', () => {
            expect(buildPageWindow(9, 10)).toEqual([6, 7, 8, 9, 10]);
        });

        it('should respect a custom maxVisible size', () => {
            expect(buildPageWindow(5, 20, 3)).toEqual([4, 5, 6]);
        });
    });
});
