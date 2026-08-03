export enum UnityType {
    BOTTLE = "BOTTLE",
    CREAM = "CREAM",
    LIQUID = "LIQUID",
}

export const UnityTypeLabels: Record<UnityType, string> = {
    [UnityType.BOTTLE]: "Frasco",
    [UnityType.CREAM]: "Creme",
    [UnityType.LIQUID]: "Líquido",
};

export enum TreatmentType {
    CONTINUOUS = "CONTINUOUS",
    SHORT_TERM = "SHORT_TERM",
    LONG_TERM = "LONG_TERM",
}

export const TreatmentTypeLabels: Record<TreatmentType, string> = {
    [TreatmentType.CONTINUOUS]: "Contínuo",
    [TreatmentType.SHORT_TERM]: "Curto prazo",
    [TreatmentType.LONG_TERM]: "Longo prazo",
};

export interface CreatePrescriptionItemMedicineRequest {
    name: string;
    eanCode?: string;
    imageUrl?: string;
}

export interface CreatePrescriptionItemRequest {
    medicine: CreatePrescriptionItemMedicineRequest;
    dosage: string;
    prescribedQuantity: number;
    unityType: UnityType;
    treatmentType: TreatmentType;
    treatmentDays: number;
}

export interface PrescriptionItemDraft extends CreatePrescriptionItemRequest {
    localId: string;
}

export function toCreatePrescriptionItemRequest(draft: PrescriptionItemDraft): CreatePrescriptionItemRequest {
    return {
        medicine: draft.medicine,
        dosage: draft.dosage,
        prescribedQuantity: draft.prescribedQuantity,
        unityType: draft.unityType,
        treatmentType: draft.treatmentType,
        treatmentDays: draft.treatmentDays,
    };
}
