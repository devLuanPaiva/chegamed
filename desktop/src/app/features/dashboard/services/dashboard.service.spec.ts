import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    DeliveriesSummaryApiDto,
    MedicinesSummaryApiDto,
    PatientsSummaryApiDto,
    PrescriptionsSummaryApiDto,
    UsersSummaryApiDto,
} from '../models/dashboard-api.model';
import { DashboardService } from './dashboard.service';

const API_URL = environment.api_url;
const COMPANY_ID = 'company-1';

function buildResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        message: 'ok',
        count: null,
        currentPage: null,
        totalPages: null,
        next: null,
        previous: null,
        data,
    };
}

describe('DashboardService', () => {
    let service: DashboardService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting(), DashboardService],
        });

        service = TestBed.inject(DashboardService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getPatientsSummary', () => {
        it('should GET /dashboard/patients/summary with the companyId param and map the response', () => {
            const dto: PatientsSummaryApiDto = {
                totalCount: 50,
                newThisMonthCount: 4,
                withoutAccountCount: 12,
                pendingRegistrationRequestsCount: 3,
            };
            let result: PatientsSummaryApiDto | undefined;

            service.getPatientsSummary(COMPANY_ID).subscribe((summary) => (result = summary));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/dashboard/patients/summary`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('companyId')).toBe(COMPANY_ID);
            req.flush(buildResponse(dto));

            expect(result).toEqual(dto);
        });
    });

    describe('getPrescriptionsSummary', () => {
        it('should GET /dashboard/prescriptions/summary with the companyId param and map the response', () => {
            const dto: PrescriptionsSummaryApiDto = {
                totalCount: 21,
                pendingCount: 7,
                canceledCount: 3,
                issuedThisMonthCount: 6,
            };
            let result: PrescriptionsSummaryApiDto | undefined;

            service.getPrescriptionsSummary(COMPANY_ID).subscribe((summary) => (result = summary));

            const req = httpMock.expectOne(
                (request) => request.url === `${API_URL}/dashboard/prescriptions/summary`,
            );
            expect(req.request.params.get('companyId')).toBe(COMPANY_ID);
            req.flush(buildResponse(dto));

            expect(result).toEqual(dto);
        });
    });

    describe('getDeliveriesSummary', () => {
        it('should GET /dashboard/deliveries/summary with the companyId param and map the response', () => {
            const dto: DeliveriesSummaryApiDto = {
                totalCount: 120,
                thisMonthCount: 9,
                overdueCount: 2,
                upcomingCount: 1,
            };
            let result: DeliveriesSummaryApiDto | undefined;

            service.getDeliveriesSummary(COMPANY_ID).subscribe((summary) => (result = summary));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/dashboard/deliveries/summary`);
            expect(req.request.params.get('companyId')).toBe(COMPANY_ID);
            req.flush(buildResponse(dto));

            expect(result).toEqual(dto);
        });
    });

    describe('getMedicinesSummary', () => {
        it('should GET /dashboard/medicines/summary with the companyId param and map the response', () => {
            const dto: MedicinesSummaryApiDto = {
                totalCount: 80,
                newThisMonthCount: 6,
                withoutEanCodeCount: 14,
                movementsThisMonthCount: 25,
            };
            let result: MedicinesSummaryApiDto | undefined;

            service.getMedicinesSummary(COMPANY_ID).subscribe((summary) => (result = summary));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/dashboard/medicines/summary`);
            expect(req.request.params.get('companyId')).toBe(COMPANY_ID);
            req.flush(buildResponse(dto));

            expect(result).toEqual(dto);
        });
    });

    describe('getUsersSummary', () => {
        it('should GET /dashboard/users/summary with the companyId param and map the response', () => {
            const dto: UsersSummaryApiDto = {
                totalCount: 30,
                activeCount: 27,
                inactiveCount: 3,
                newThisMonthCount: 2,
            };
            let result: UsersSummaryApiDto | undefined;

            service.getUsersSummary(COMPANY_ID).subscribe((summary) => (result = summary));

            const req = httpMock.expectOne((request) => request.url === `${API_URL}/dashboard/users/summary`);
            expect(req.request.params.get('companyId')).toBe(COMPANY_ID);
            req.flush(buildResponse(dto));

            expect(result).toEqual(dto);
        });
    });
});
