import { PatientRegistrationRequestStatus } from "@/data/models/patient.model";

export interface IVisitorCompany {
    id: string;
    name: string;
    imageUrl?: string;
}

export interface IVisitorRegistrationRequest {
    id: string;
    companyId: string;
    companyName: string;
    name: string;
    maskedCpf: string;
    status: PatientRegistrationRequestStatus;
    createdAt: Date;
}

export interface CreateVisitorRegistrationRequest {
    companyId: string;
    name: string;
    cpf: string;
    birthDate: string;
    contact?: string;
    address?: string;
}
