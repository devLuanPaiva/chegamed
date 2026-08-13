import { parseLocalDate } from '@shared/utils/date.util';

import { IPatient, IPatientRegistrationRequest, PatientRegistrationRequestStatus } from './patient.model';

export interface PatientApiDto {
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

export interface CreatePatientRequest {
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    contact?: string;
    address?: string;
}

export interface CreatePatientWithAccountRequest {
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    email: string;
    password: string;
    imageUrl?: string;
    contact?: string;
    address?: string;
}

export interface CreatePatientAccountRequest {
    email: string;
    password: string;
}

export interface UpdatePatientRequest {
    name?: string;
    cpf?: string;
    birthDate?: string;
    contact?: string;
    address?: string;
}

export interface PatientFilterParams {
    companyId?: string;
    name?: string;
    cpf?: string;
}

export interface PatientsPage {
    patients: IPatient[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toPatient(dto: PatientApiDto): IPatient {
    return {
        id: dto.id,
        name: dto.name,
        cpf: dto.cpf,
        birthDate: parseLocalDate(dto.birthDate),
        companyId: dto.companyId,
        userId: dto.userId ?? undefined,
        contact: dto.contact ?? undefined,
        address: dto.address ?? undefined,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    };
}

export interface PatientRegistrationRequestApiDto {
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

export interface PendingPatientRegistrationRequestsPage {
    requests: IPatientRegistrationRequest[];
    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
}

export function toPatientRegistrationRequest(dto: PatientRegistrationRequestApiDto): IPatientRegistrationRequest {
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
