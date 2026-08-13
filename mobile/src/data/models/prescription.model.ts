import { CreatePrescriptionItemRequest } from "@/data/models/prescription-item.model";

export enum PrescriptionStatus {
    PENDING = "PENDING",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    PARTIAL_DELIVERED = "PARTIAL_DELIVERED",
    CANCELED = "CANCELED",
}

export const PrescriptionStatusLabels: Record<PrescriptionStatus, string> = {
    [PrescriptionStatus.PENDING]: "Pendente",
    [PrescriptionStatus.OUT_FOR_DELIVERY]: "Em entrega",
    [PrescriptionStatus.DELIVERED]: "Entregue",
    [PrescriptionStatus.PARTIAL_DELIVERED]: "Entrega parcial",
    [PrescriptionStatus.CANCELED]: "Cancelada",
};

export interface IPrescription {
    id: string;
    status: PrescriptionStatus;
    imageUrls: string[];
    issueDate: Date;
    patientId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePrescriptionRequest {
    imageUrls?: string[];
    issueDate: string;
    patientId: string;
    items: CreatePrescriptionItemRequest[];
}
