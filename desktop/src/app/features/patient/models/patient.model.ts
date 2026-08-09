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

export enum PatientRegistrationRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

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
