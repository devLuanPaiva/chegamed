import { apiFetch } from "@/lib/apiFetch";
import { onlyDigits } from "@/lib/cpf";
import { PagedResult } from "@/lib/pagination";
import { UnityType } from "@/data/models/prescription-item.model";
import { PrescriptionStatus } from "@/data/models/prescription.model";
import {
    CreateDeliveryRequest,
    DeliveryFilterParams,
    IDelivery,
    IPendingDeliveryItem,
} from "@/data/models/delivery.model";

const PAGE_SIZE = 20;

interface DeliveryDto {
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
    deliveryDate: string;
    nextAvailableDate: string;
    deliveryQuantity: number;
    createdAt: string;
    updatedAt: string;
}

interface PendingDeliveryItemDto {
    prescriptionItemId: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    patientAddress: string | null;
    patientContact: string | null;
    issueDate: string;
    medicineName: string;
    dosage: string | null;
    status: PrescriptionStatus;
    unityType: UnityType;
    prescribedQuantity: number;
    outForDeliveryAt: string | null;
}

function toDelivery(dto: DeliveryDto): IDelivery {
    return {
        id: dto.id,
        companyId: dto.companyId,
        patientId: dto.patientId,
        patientName: dto.patientName,
        patientAddress: dto.patientAddress,
        prescriptionItemId: dto.prescriptionItemId,
        medicineName: dto.medicineName,
        unityType: dto.unityType,
        delivererId: dto.delivererId,
        delivererName: dto.delivererName,
        deliveryDate: new Date(dto.deliveryDate),
        nextAvailableDate: new Date(dto.nextAvailableDate),
        deliveryQuantity: dto.deliveryQuantity,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

function toPendingDeliveryItem(dto: PendingDeliveryItemDto): IPendingDeliveryItem {
    return {
        prescriptionItemId: dto.prescriptionItemId,
        prescriptionId: dto.prescriptionId,
        patientId: dto.patientId,
        patientName: dto.patientName,
        patientAddress: dto.patientAddress,
        patientContact: dto.patientContact,
        issueDate: new Date(dto.issueDate),
        medicineName: dto.medicineName,
        dosage: dto.dosage,
        status: dto.status,
        unityType: dto.unityType,
        prescribedQuantity: dto.prescribedQuantity,
        outForDeliveryAt: dto.outForDeliveryAt ? new Date(dto.outForDeliveryAt) : null,
    };
}

function buildPageParams(page: number): URLSearchParams {
    return new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
}

function buildFilterParams(companyId: string, page: number, filter?: DeliveryFilterParams): URLSearchParams {
    const params = buildPageParams(page);
    params.set("companyId", companyId);

    const patientName = filter?.patientName?.trim();
    const patientCpf = filter?.patientCpf?.trim();

    if (patientName) {
        params.set("patientName", patientName);
    }

    if (patientCpf) {
        params.set("patientCpf", onlyDigits(patientCpf));
    }

    if (filter?.status) {
        params.set("status", filter.status);
    }

    return params;
}

export async function getDeliveries(
    companyId: string,
    page: number,
    filter?: DeliveryFilterParams,
): Promise<PagedResult<IDelivery>> {
    const params = buildFilterParams(companyId, page, filter);
    const response = await apiFetch<DeliveryDto[]>(`/deliveries?${params.toString()}`);

    return {
        data: response.data.map(toDelivery),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getPendingDeliveryItems(
    companyId: string,
    page: number,
    filter?: DeliveryFilterParams,
): Promise<PagedResult<IPendingDeliveryItem>> {
    const params = buildFilterParams(companyId, page, filter);
    const response = await apiFetch<PendingDeliveryItemDto[]>(`/deliveries/pending-items?${params.toString()}`);

    return {
        data: response.data.map(toPendingDeliveryItem),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getMyDeliveries(page: number): Promise<PagedResult<IDelivery>> {
    const response = await apiFetch<DeliveryDto[]>(`/deliveries/me?${buildPageParams(page).toString()}`);

    return {
        data: response.data.map(toDelivery),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getMyPendingDeliveryItems(page: number): Promise<PagedResult<IPendingDeliveryItem>> {
    const response = await apiFetch<PendingDeliveryItemDto[]>(
        `/deliveries/me/pending-items?${buildPageParams(page).toString()}`,
    );

    return {
        data: response.data.map(toPendingDeliveryItem),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getMyOutForDeliveryItems(page: number): Promise<PagedResult<IPendingDeliveryItem>> {
    const response = await apiFetch<PendingDeliveryItemDto[]>(
        `/deliveries/me/out-for-delivery?${buildPageParams(page).toString()}`,
    );

    return {
        data: response.data.map(toPendingDeliveryItem),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getMyCompletedDeliveries(page: number): Promise<PagedResult<IDelivery>> {
    const response = await apiFetch<DeliveryDto[]>(`/deliveries/me/completed?${buildPageParams(page).toString()}`);

    return {
        data: response.data.map(toDelivery),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function deliverPrescriptionItem(payload: CreateDeliveryRequest): Promise<IDelivery> {
    const response = await apiFetch<DeliveryDto>("/deliveries", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return toDelivery(response.data);
}

export async function dispatchPrescriptionItemForDelivery(prescriptionItemId: string): Promise<IPendingDeliveryItem> {
    const response = await apiFetch<PendingDeliveryItemDto>(`/deliveries/dispatches/${prescriptionItemId}`, {
        method: "POST",
    });

    return toPendingDeliveryItem(response.data);
}
