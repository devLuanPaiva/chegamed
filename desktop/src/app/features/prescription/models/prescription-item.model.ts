import { IMedicine } from '@features/medicine/models/medicine.model';

import { PrescriptionStatus } from './prescription.model';

export enum UnityType {
    BOTTLE = 'BOTTLE',
    CREAM = 'CREAM',
    LIQUID = 'LIQUID',
}

export const UnityTypeLabels: Record<UnityType, string> = {
    [UnityType.BOTTLE]: 'Frasco',
    [UnityType.CREAM]: 'Creme',
    [UnityType.LIQUID]: 'Líquido',
};

export enum TreatmentType {
    CONTINUOUS = 'CONTINUOUS',
    SHORT_TERM = 'SHORT_TERM',
    LONG_TERM = 'LONG_TERM',
}

export const TreatmentTypeLabels: Record<TreatmentType, string> = {
    [TreatmentType.CONTINUOUS]: 'Contínuo',
    [TreatmentType.SHORT_TERM]: 'Curto prazo',
    [TreatmentType.LONG_TERM]: 'Longo prazo',
};

export interface IPrescriptionItem {
    id: string;
    prescriptionId: string;
    medicine: IMedicine;
    status: PrescriptionStatus;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    treatmentType: TreatmentType;
    treatmentDays: number;
    observations: string | null;
    startDate: Date | null;
    receivedQuantity: number | null;
    deliveredQuantity: number | null;
    requestedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
