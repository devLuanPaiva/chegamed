import { UnityType } from "@/data/models/prescription-item.model";
import { PrescriptionStatus } from "@/data/models/prescription.model";

export interface IDelivery {
    id: string;
    companyId: string;
    patientId: string;
    patientName: string;
    patientAddress: string | null;
    prescriptionItemId: string;
    medicineName: string;
    unityType: UnityType;
    delivererId: string | null;
    delivererName: string | null;
    deliveryDate: Date;
    nextAvailableDate: Date;
    deliveryQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPendingDeliveryItem {
    prescriptionItemId: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    patientAddress: string | null;
    patientContact: string | null;
    issueDate: Date;
    medicineName: string;
    dosage: string | null;
    status: PrescriptionStatus;
    unityType: UnityType;
    prescribedQuantity: number;
    outForDeliveryAt: Date | null;
}

export interface DeliveryFilterParams {
    patientName?: string;
    patientCpf?: string;
    status?: PrescriptionStatus;
}

export interface CreateDeliveryRequest {
    prescriptionItemId: string;
    deliveryDate: string;
    deliveryQuantity: number;
}
