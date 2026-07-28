export type AiOperationType =
    | 'ESUS_PRESCRIPTION_EXTRACTION'
    | 'DIGITALIZED_PRESCRIPTION_EXTRACTION'
    | 'BARCODE_EXTRACTION'
    | 'MEDICINE_NAME_EXTRACTION';

export type AiContentType = 'IMAGE' | 'CHAT_MESSAGE';

export const AiOperationTypeLabels: Record<AiOperationType, string> = {
    ESUS_PRESCRIPTION_EXTRACTION: 'Extração de receita e-SUS',
    DIGITALIZED_PRESCRIPTION_EXTRACTION: 'Extração de receita digitalizada',
    BARCODE_EXTRACTION: 'Leitura de código de barras',
    MEDICINE_NAME_EXTRACTION: 'Leitura de nome de medicamento',
};

export const AiContentTypeLabels: Record<AiContentType, string> = {
    IMAGE: 'Imagem',
    CHAT_MESSAGE: 'Mensagem de chatbot',
};

export interface IAiUsageLog {
    id: string;
    userId: string;
    userName: string;
    model: string;
    operationType: AiOperationType;
    contentType: AiContentType;
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    createdAt: Date;
}

export interface IAiUsageModelBreakdown {
    model: string;
    requests: number;
    totalTokens: number;
    costUsd: number;
}

export interface IAiUsageDailyBreakdown {
    date: Date;
    requests: number;
    totalTokens: number;
    costUsd: number;
}

export interface IAiUsageSummary {
    totalRequests: number;
    totalPromptTokens: number;
    totalCandidatesTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    avgCostPerRequestUsd: number;
    byModel: IAiUsageModelBreakdown[];
    byDay: IAiUsageDailyBreakdown[];
}

export interface IAiUsageFilter {
    model?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}
