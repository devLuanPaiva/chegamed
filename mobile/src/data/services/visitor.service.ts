import { apiFetch } from "@/lib/apiFetch";
import { PatientRegistrationRequestStatus } from "@/data/models/patient.model";
import {
    CreateVisitorRegistrationRequest,
    IVisitorCompany,
    IVisitorRegistrationRequest,
} from "@/data/models/visitor.model";

interface VisitorCompanyDto {
    id: string;
    name: string;
    imageUrl: string | null;
}

interface VisitorRegistrationRequestDto {
    id: string;
    companyId: string;
    companyName: string;
    name: string;
    maskedCpf: string;
    status: PatientRegistrationRequestStatus;
    createdAt: string;
}

function toVisitorCompany(dto: VisitorCompanyDto): IVisitorCompany {
    return {
        id: dto.id,
        name: dto.name,
        imageUrl: dto.imageUrl ?? undefined,
    };
}

function toVisitorRegistrationRequest(dto: VisitorRegistrationRequestDto): IVisitorRegistrationRequest {
    return {
        id: dto.id,
        companyId: dto.companyId,
        companyName: dto.companyName,
        name: dto.name,
        maskedCpf: dto.maskedCpf,
        status: dto.status,
        createdAt: new Date(dto.createdAt),
    };
}

export async function getCompaniesOpenForRegistration(): Promise<IVisitorCompany[]> {
    const response = await apiFetch<VisitorCompanyDto[]>("/visitor/companies");

    return response.data.map(toVisitorCompany);
}

export async function createVisitorRegistrationRequest(
    payload: CreateVisitorRegistrationRequest,
): Promise<IVisitorRegistrationRequest> {
    const response = await apiFetch<VisitorRegistrationRequestDto>("/visitor/patient-registration-requests", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return toVisitorRegistrationRequest(response.data);
}

export async function getMyRegistrationRequest(): Promise<IVisitorRegistrationRequest | null> {
    const response = await apiFetch<VisitorRegistrationRequestDto | null>(
        "/visitor/patient-registration-requests/me",
    );

    return response.data ? toVisitorRegistrationRequest(response.data) : null;
}
