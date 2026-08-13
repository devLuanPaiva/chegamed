import { apiFetch } from "@/lib/apiFetch";
import { onlyDigits } from "@/lib/cpf";
import { PagedResult } from "@/lib/pagination";
import {
    CreatePatientRequest,
    IPatient,
    IPatientRegistrationRequest,
    PatientFilterParams,
    PatientRegistrationRequestStatus,
    UpdatePatientRequest,
} from "@/data/models/patient.model";

const PATIENT_SEARCH_PAGE_SIZE = 20;
const PATIENT_PAGE_SIZE = 20;
const PENDING_REQUEST_PAGE_SIZE = 20;

interface PatientDto {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    userId: string | null;
    contact: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
}

function toPatient(dto: PatientDto): IPatient {
    return {
        id: dto.id,
        name: dto.name,
        cpf: dto.cpf,
        birthDate: new Date(dto.birthDate),
        companyId: dto.companyId,
        userId: dto.userId ?? undefined,
        contact: dto.contact ?? undefined,
        address: dto.address ?? undefined,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

export async function searchPatients(term: string, companyId?: string): Promise<IPatient[]> {
    const trimmed = term.trim();

    if (!trimmed) {
        return [];
    }

    const isNumeric = /^\d+$/.test(onlyDigits(trimmed));

    const params = new URLSearchParams({
        page: "0",
        size: String(PATIENT_SEARCH_PAGE_SIZE),
    });

    if (companyId) {
        params.set("companyId", companyId);
    }

    if (isNumeric) {
        params.set("cpf", onlyDigits(trimmed));
    } else {
        params.set("name", trimmed);
    }

    const response = await apiFetch<PatientDto[]>(`/patients?${params.toString()}`);
    return response.data.map(toPatient);
}

function buildFilterParams(companyId: string, page: number, filter?: PatientFilterParams): URLSearchParams {
    const params = new URLSearchParams({
        page: String(page),
        size: String(PATIENT_PAGE_SIZE),
        companyId,
    });

    const name = filter?.name?.trim();
    const cpf = filter?.cpf?.trim();

    if (name) {
        params.set("name", name);
    }

    if (cpf) {
        params.set("cpf", onlyDigits(cpf));
    }

    return params;
}

export async function getPatients(
    companyId: string,
    page: number,
    filter?: PatientFilterParams,
): Promise<PagedResult<IPatient>> {
    const params = buildFilterParams(companyId, page, filter);
    const response = await apiFetch<PatientDto[]>(`/patients?${params.toString()}`);

    return {
        data: response.data.map(toPatient),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function getPatientById(id: string): Promise<IPatient> {
    const response = await apiFetch<PatientDto>(`/patients/${id}`);
    return toPatient(response.data);
}

export async function createPatient(payload: CreatePatientRequest): Promise<IPatient> {
    const response = await apiFetch<PatientDto>("/patients", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return toPatient(response.data);
}

export async function updatePatient(id: string, payload: UpdatePatientRequest): Promise<IPatient> {
    const response = await apiFetch<PatientDto>(`/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });

    return toPatient(response.data);
}

interface PatientRegistrationRequestDto {
    id: string;
    companyId: string;
    name: string;
    maskedCpf: string;
    contact: string | null;
    address: string | null;
    email: string;
    status: string;
    createdAt: string;
}

function toPatientRegistrationRequest(dto: PatientRegistrationRequestDto): IPatientRegistrationRequest {
    return {
        id: dto.id,
        companyId: dto.companyId,
        name: dto.name,
        maskedCpf: dto.maskedCpf,
        contact: dto.contact ?? undefined,
        address: dto.address ?? undefined,
        email: dto.email,
        status: dto.status as PatientRegistrationRequestStatus,
        createdAt: new Date(dto.createdAt),
    };
}

export async function getPendingRegistrationRequests(page: number): Promise<PagedResult<IPatientRegistrationRequest>> {
    const params = new URLSearchParams({ page: String(page), size: String(PENDING_REQUEST_PAGE_SIZE) });
    const response = await apiFetch<PatientRegistrationRequestDto[]>(
        `/patient-registration-requests?${params.toString()}`,
    );

    return {
        data: response.data.map(toPatientRegistrationRequest),
        currentPage: response.currentPage ?? page,
        totalPages: response.totalPages ?? 1,
    };
}

export async function approveRegistrationRequest(id: string): Promise<IPatient> {
    const response = await apiFetch<PatientDto>(`/patient-registration-requests/${id}/approve`, {
        method: "POST",
    });

    return toPatient(response.data);
}

export async function rejectRegistrationRequest(id: string): Promise<void> {
    await apiFetch<null>(`/patient-registration-requests/${id}/reject`, { method: "POST" });
}
