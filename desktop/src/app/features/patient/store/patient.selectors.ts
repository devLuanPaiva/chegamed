import { createFeatureSelector, createSelector } from '@ngrx/store';

import { PatientState } from './patient.state';

export const selectPatientState = createFeatureSelector<PatientState>('patients');

export const selectAllPatients = createSelector(selectPatientState, (state) => state.items);

export const selectPatientsLoading = createSelector(selectPatientState, (state) => state.loading);

export const selectPatientsError = createSelector(selectPatientState, (state) => state.error);

export const selectPatientsMutating = createSelector(selectPatientState, (state) => state.mutating);

export const selectPatientsPagination = createSelector(selectPatientState, (state) => ({
    count: state.count,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    next: state.next,
    previous: state.previous,
}));

export const selectSelectedPatient = createSelector(selectPatientState, (state) => state.selectedPatient);

export const selectSelectedPatientLoading = createSelector(selectPatientState, (state) => state.selectedPatientLoading);

export const selectPatientAccountMutating = createSelector(selectPatientState, (state) => state.accountMutating);

export const selectPendingRegistrationRequests = createSelector(selectPatientState, (state) => state.pendingRequests);

export const selectPendingRegistrationRequestsLoading = createSelector(selectPatientState, (state) => state.pendingLoading);

export const selectPendingRegistrationRequestsError = createSelector(selectPatientState, (state) => state.pendingError);

export const selectPendingRegistrationRequestsPagination = createSelector(selectPatientState, (state) => ({
    count: state.pendingCount,
    currentPage: state.pendingCurrentPage,
    totalPages: state.pendingTotalPages,
    next: state.pendingNext,
    previous: state.pendingPrevious,
}));

export const selectReviewingRequestId = createSelector(selectPatientState, (state) => state.reviewingRequestId);
