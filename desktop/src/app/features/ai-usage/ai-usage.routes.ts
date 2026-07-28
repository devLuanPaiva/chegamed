import { Routes } from '@angular/router';

export const aiUsageRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/ai-usage-page/ai-usage-page').then((m) => m.AiUsagePage),
        title: 'Custos da IA',
    },
];
