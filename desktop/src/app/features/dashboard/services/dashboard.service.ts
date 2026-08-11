import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ApiResponse } from '@shared/models/api-response.model';

import {
    AvailabilityListApiDto,
    DeliveriesSummaryApiDto,
    DeliveryQueueSummaryApiDto,
    DeliveryTimelineApiDto,
    FulfillmentSummaryApiDto,
    MedicinesSummaryApiDto,
    PatientsSummaryApiDto,
    PrescriptionsSummaryApiDto,
    PrescriptionStatusBreakdownApiDto,
    toAvailabilityList,
    toDeliveriesSummary,
    toDeliveryQueueSummary,
    toDeliveryTimeline,
    toFulfillmentSummary,
    toMedicinesSummary,
    toPatientsSummary,
    toPrescriptionsSummary,
    toPrescriptionStatusBreakdown,
    toUsersSummary,
    UsersSummaryApiDto,
} from '../models/dashboard-api.model';
import {
    DeliveryTimelineGranularity,
    IAvailabilityList,
    IDeliveriesSummary,
    IDeliveryQueueSummary,
    IDeliveryTimeline,
    IFulfillmentSummary,
    IMedicinesSummary,
    IPatientsSummary,
    IPrescriptionsSummary,
    IPrescriptionStatusBreakdown,
    IUsersSummary,
} from '../models/dashboard.model';

const DEFAULT_UPCOMING_DAYS = 7;

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = signal(environment.api_url);

    getPrescriptionStatusBreakdown(companyId: string): Observable<IPrescriptionStatusBreakdown> {
        return this.http
            .get<ApiResponse<PrescriptionStatusBreakdownApiDto>>(
                `${this.apiUrl()}/dashboard/prescriptions/status-breakdown`,
                { params: { companyId } },
            )
            .pipe(map((response) => toPrescriptionStatusBreakdown(response.data)));
    }

    getQueueSummary(companyId: string): Observable<IDeliveryQueueSummary> {
        return this.http
            .get<ApiResponse<DeliveryQueueSummaryApiDto>>(`${this.apiUrl()}/dashboard/deliveries/queue-summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toDeliveryQueueSummary(response.data)));
    }

    getUpcomingAvailability(companyId: string, days = DEFAULT_UPCOMING_DAYS): Observable<IAvailabilityList> {
        return this.http
            .get<ApiResponse<AvailabilityListApiDto>>(`${this.apiUrl()}/dashboard/deliveries/upcoming-availability`, {
                params: { companyId, days },
            })
            .pipe(map((response) => toAvailabilityList(response.data)));
    }

    getOverdueAvailability(companyId: string): Observable<IAvailabilityList> {
        return this.http
            .get<ApiResponse<AvailabilityListApiDto>>(`${this.apiUrl()}/dashboard/deliveries/overdue-availability`, {
                params: { companyId },
            })
            .pipe(map((response) => toAvailabilityList(response.data)));
    }

    getFulfillmentSummary(companyId: string, from?: string, to?: string): Observable<IFulfillmentSummary> {
        return this.http
            .get<ApiResponse<FulfillmentSummaryApiDto>>(`${this.apiUrl()}/dashboard/deliveries/fulfillment-summary`, {
                params: { companyId, ...(from ? { from } : {}), ...(to ? { to } : {}) },
            })
            .pipe(map((response) => toFulfillmentSummary(response.data)));
    }

    getDeliveryTimeline(
        companyId: string,
        granularity: DeliveryTimelineGranularity = DeliveryTimelineGranularity.DAY,
        from?: string,
        to?: string,
    ): Observable<IDeliveryTimeline> {
        return this.http
            .get<ApiResponse<DeliveryTimelineApiDto>>(`${this.apiUrl()}/dashboard/deliveries/timeline`, {
                params: { companyId, granularity, ...(from ? { from } : {}), ...(to ? { to } : {}) },
            })
            .pipe(map((response) => toDeliveryTimeline(response.data)));
    }

    getPatientsSummary(companyId: string): Observable<IPatientsSummary> {
        return this.http
            .get<ApiResponse<PatientsSummaryApiDto>>(`${this.apiUrl()}/dashboard/patients/summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toPatientsSummary(response.data)));
    }

    getPrescriptionsSummary(companyId: string): Observable<IPrescriptionsSummary> {
        return this.http
            .get<ApiResponse<PrescriptionsSummaryApiDto>>(`${this.apiUrl()}/dashboard/prescriptions/summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toPrescriptionsSummary(response.data)));
    }

    getDeliveriesSummary(companyId: string): Observable<IDeliveriesSummary> {
        return this.http
            .get<ApiResponse<DeliveriesSummaryApiDto>>(`${this.apiUrl()}/dashboard/deliveries/summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toDeliveriesSummary(response.data)));
    }

    getMedicinesSummary(companyId: string): Observable<IMedicinesSummary> {
        return this.http
            .get<ApiResponse<MedicinesSummaryApiDto>>(`${this.apiUrl()}/dashboard/medicines/summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toMedicinesSummary(response.data)));
    }

    getUsersSummary(companyId: string): Observable<IUsersSummary> {
        return this.http
            .get<ApiResponse<UsersSummaryApiDto>>(`${this.apiUrl()}/dashboard/users/summary`, {
                params: { companyId },
            })
            .pipe(map((response) => toUsersSummary(response.data)));
    }
}
