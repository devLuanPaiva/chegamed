import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

import { ChartComponent } from '@shared/ui/chart/chart';
import { WidgetCard } from '@shared/ui/widget-card/widget-card';
import { cssVar } from '@shared/utils/css-var.util';

import { IAiUsageSummary } from '../../models/ai-usage.model';
import { formatUsd } from '../../utils/ai-usage-format.util';

const MODEL_COLORS = ['#2a78d6', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#c98a1e'];

@Component({
    selector: 'app-ai-usage-model-chart',
    imports: [WidgetCard, ChartComponent],
    templateUrl: './ai-usage-model-chart.html',
    styleUrl: './ai-usage-model-chart.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiUsageModelChart {
    readonly summary = input.required<IAiUsageSummary>();
    readonly loading = input(false);
    readonly error = input<string | null>(null);

    readonly chartData = computed<ChartData>(() => {
        const byModel = this.summary().byModel;

        return {
            labels: byModel.map((entry) => entry.model),
            datasets: [
                {
                    data: byModel.map((entry) => entry.costUsd),
                    backgroundColor: byModel.map((_, index) => MODEL_COLORS[index % MODEL_COLORS.length]),
                    borderRadius: 4,
                    barThickness: 20,
                },
            ],
        };
    });

    readonly chartOptions = computed<ChartOptions>(() => {
        const byModel = this.summary().byModel;

        return {
            indexAxis: 'y',
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
                            const entry = byModel[context.dataIndex];
                            return [formatUsd(entry.costUsd), `${entry.requests} requisição(ões)`];
                        },
                    },
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: cssVar('--text-secondary', '#6b7280') },
                    grid: { color: cssVar('--color-neutral-300', '#d9d4cc') },
                },
                y: {
                    ticks: { color: cssVar('--text-primary', '#1f2937') },
                    grid: { display: false },
                },
            },
        };
    });
}
