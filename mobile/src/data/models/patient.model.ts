export interface IPatient {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    companyId: string;
    userId?: string;
    contact?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PatientFilterParams {
    name?: string;
    cpf?: string;
}

export interface CreatePatientRequest {
    name: string;
    cpf: string;
    birthDate: string;
    companyId: string;
    contact?: string;
    address?: string;
}

export interface UpdatePatientRequest {
    name?: string;
    cpf?: string;
    birthDate?: string;
    contact?: string;
    address?: string;
}

export type PatientRegistrationRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IPatientRegistrationRequest {
    id: string;
    companyId: string;
    name: string;
    maskedCpf: string;
    contact?: string;
    address?: string;
    email: string;
    status: PatientRegistrationRequestStatus;
    createdAt: Date;
}
