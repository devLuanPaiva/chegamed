import { IPatient, IPatientRegistrationRequest } from '../models/patient.model';

export interface PatientState {
    items: IPatient[];

    loading: boolean;
    error: string | null;
    mutating: boolean;

    count: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;

    selectedPatient: IPatient | null;
    selectedPatientLoading: boolean;

    accountMutating: boolean;

    pendingRequests: IPatientRegistrationRequest[];
    pendingLoading: boolean;
    pendingError: string | null;
    pendingCount: number;
    pendingCurrentPage: number;
    pendingTotalPages: number;
    pendingNext: string | null;
    pendingPrevious: string | null;
    reviewingRequestId: string | null;
}
