import { apiFetch } from "@/lib/apiFetch";
import { PrescriptionStatus } from "@/data/models/prescription.model";

interface PrescriptionItemDto {
    id: string;
    prescriptionId: string;
    status: PrescriptionStatus;
}

export async function cancelPrescriptionItem(prescriptionItemId: string): Promise<PrescriptionStatus> {
    const response = await apiFetch<PrescriptionItemDto>(`/prescription-items/${prescriptionItemId}/cancellation`, {
        method: "PATCH",
    });

    return response.data.status;
}
