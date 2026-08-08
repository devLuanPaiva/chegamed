import { IPatient } from '@features/patient/models/patient.model';

import { IPrescriptionItem } from './prescription-item.model';

export enum PrescriptionStatus {
    PENDING = 'PENDING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    PARTIAL_DELIVERED = 'PARTIAL_DELIVERED',
    CANCELED = 'CANCELED',
}

export const PrescriptionStatusLabels: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: 'Pendente',
    [PrescriptionStatus.OUT_FOR_DELIVERY]: 'Em entrega',
    [PrescriptionStatus.DELIVERED]: 'Entregue',
    [PrescriptionStatus.PARTIAL_DELIVERED]: 'Entrega parcial',
    [PrescriptionStatus.CANCELED]: 'Cancelada',
};

export interface IPrescriptionPatientSummary {
    id: string;
    name: string;
}

export interface IPrescription {
    id: string;
    status: PrescriptionStatus;
    imageUrls: string[];
    issueDate: Date;
    patientId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPrescriptionListItem extends IPrescription {
    patient: IPrescriptionPatientSummary;
}

export interface IPrescriptionDetail extends IPrescription {
    patient: IPatient;
    items: IPrescriptionItem[];
}
