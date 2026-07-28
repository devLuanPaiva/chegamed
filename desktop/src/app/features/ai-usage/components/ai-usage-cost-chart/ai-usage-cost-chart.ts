import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

import { ChartComponent } from '@shared/ui/chart/chart';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { cssVar } from '@shared/utils/css-var.util';

import { IAiUsageSummary } from '../../models/ai-usage.model';
import { formatShortDate, formatUsd } from '../../utils/ai-usage-format.util';

const SERIES_COLOR = '#2a78d6';
const SERIES_FILL = '#2a78d61a';

@Component({
    selector: 'app-ai-usage-cost-chart',
    imports: [WidgetCard, ChartComponent],
    templateUrl: './ai-usage-cost-chart.html',
    styleUrl: './ai-usage-cost-chart.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsageCostChart {
    readonly summary = input.required<IAiUsageSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly chartData = computed<ChartData>(() => {
        const byDay = this.summary().byDay;

        return {
            labels: byDay.map((point) => formatShortDate(point.date)),
            datasets: [
                {
                    label: 'Custo estimado (USD)',
                    data: byDay.map((point) => point.costUsd),
                    borderColor: SERIES_COLOR,
                    backgroundColor: SERIES_FILL,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: SERIES_COLOR,
                    fill: true,
                    tension: 0.3,
                },
            ],
        };
    });

    readonly chartOptions = computed<ChartOptions>(() => {
        const byDay = this.summary().byDay;

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: cssVar('--color-primary-600', '#01402e'),
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        label: (context) => {
                            const point = byDay[context.dataIndex];
                            return [formatUsd(point.costUsd), `${point.requests} requisição(ões)`];
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: cssVar('--text-secondary', '#6b7280'), maxRotation: 0 },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: cssVar('--text-secondary', '#6b7280') },
                    grid: { color: cssVar('--color-neutral-300', '#d9d4cc') },
                },
            },
        };
    });
}
