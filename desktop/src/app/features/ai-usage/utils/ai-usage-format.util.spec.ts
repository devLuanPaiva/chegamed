import { describe, expect, it } from 'vitest';

import { formatDateTime, formatShortDate, formatTokens, formatUsd } from './ai-usage-format.util';

describe('ai-usage-format.util', () => {
    describe('formatUsd', () => {
        it('should format a value as a USD currency string', () => {
            expect(formatUsd(1.2)).toBe('$1.20');
        });

        it('should keep up to four decimal places for very small costs', () => {
            expect(formatUsd(0.0015)).toBe('$0.0015');
        });

        it('should format zero as $0.00', () => {
            expect(formatUsd(0)).toBe('$0.00');
        });
    });

    describe('formatTokens', () => {
        it('should format a token count with pt-BR thousands separators', () => {
            expect(formatTokens(1234567)).toBe('1.234.567');
        });

        it('should format zero as 0', () => {
            expect(formatTokens(0)).toBe('0');
        });
    });

    describe('formatShortDate', () => {
        it('should format a date as day/month', () => {
            expect(formatShortDate(new Date(2026, 0, 5))).toBe('05/01');
        });
    });

    describe('formatDateTime', () => {
        it('should format a date with day, month, year, hour and minute in America/Fortaleza time', () => {
            const result = formatDateTime(new Date('2026-01-05T14:30:00-03:00'));

            expect(result).toContain('05/01/2026');
            expect(result).toContain('14:30');
        });
    });
});
