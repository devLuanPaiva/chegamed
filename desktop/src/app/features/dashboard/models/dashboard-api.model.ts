import { PrescriptionStatus } from '@features/prescription/models/prescription.model';
import { UnityType } from '@features/prescription/models/prescription-item.model';
import { parseLocalDate } from '@shared/utils/date.util';

import {
    DeliveryTimelineGranularity,
    IAvailabilityItem,
    IAvailabilityList,
    IDeliveriesSummary,
    IDeliveryQueueSummary,
    IDeliveryTimeline,
    IDeliveryTimelinePoint,
    IFulfillmentSummary,
    IMedicinesSummary,
    IPatientsSummary,
    IPrescriptionsSummary,
    IPrescriptionStatusBreakdown,
    IPrescriptionStatusCount,
    IQueueItem,
    IUsersSummary,
} from './dashboard.model';

export interface PrescriptionStatusCountApiDto {
    status: PrescriptionStatus;
    count: number;
}

export interface PrescriptionStatusBreakdownApiDto {
    totalPrescriptions: number;
    items: PrescriptionStatusCountApiDto[];
}

export interface QueueItemApiDto {
    prescriptionItemId: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    medicineName: string;
    unityType: UnityType;
    prescribedQuantity: number;
    requestedAt: string;
    waitingDays: number;
}

export interface DeliveryQueueSummaryApiDto {
    pendingCount: number;
    averageWaitDays: number | null;
    oldestPending: QueueItemApiDto[];
}

export interface AvailabilityItemApiDto {
    deliveryId: string;
    patientId: string;
    patientName: string;
    medicineName: string;
    unityType: UnityType;
    nextAvailableDate: string;
    daysUntilAvailable: number;
}

export interface AvailabilityListApiDto {
    count: number;
    items: AvailabilityItemApiDto[];
}

export interface FulfillmentSummaryApiDto {
    deliveredCount: number;
    partialCount: number;
    totalCount: number;
    completionRate: number | null;
    prescribedQuantityTotal: number;
    deliveredQuantityTotal: number;
    coverageRate: number | null;
}

export interface DeliveryTimelinePointApiDto {
    periodStart: string;
    deliveriesCount: number;
    quantityTotal: number;
}

export interface DeliveryTimelineApiDto {
    granularity: DeliveryTimelineGranularity;
    points: DeliveryTimelinePointApiDto[];
}

export function toPrescriptionStatusCount(dto: PrescriptionStatusCountApiDto): IPrescriptionStatusCount {
    return { ...dto };
}

export function toPrescriptionStatusBreakdown(dto: PrescriptionStatusBreakdownApiDto): IPrescriptionStatusBreakdown {
    return {
        totalPrescriptions: dto.totalPrescriptions,
        items: dto.items.map(toPrescriptionStatusCount),
    };
}

export function toQueueItem(dto: QueueItemApiDto): IQueueItem {
    return {
        ...dto,
        requestedAt: new Date(dto.requestedAt),
    };
}

export function toDeliveryQueueSummary(dto: DeliveryQueueSummaryApiDto): IDeliveryQueueSummary {
    return {
        pendingCount: dto.pendingCount,
        averageWaitDays: dto.averageWaitDays,
        oldestPending: dto.oldestPending.map(toQueueItem),
    };
}

export function toAvailabilityItem(dto: AvailabilityItemApiDto): IAvailabilityItem {
    return {
        ...dto,
        nextAvailableDate: parseLocalDate(dto.nextAvailableDate),
    };
}

export function toAvailabilityList(dto: AvailabilityListApiDto): IAvailabilityList {
    return {
        count: dto.count,
        items: dto.items.map(toAvailabilityItem),
    };
}

export function toFulfillmentSummary(dto: FulfillmentSummaryApiDto): IFulfillmentSummary {
    return { ...dto };
}

export function toDeliveryTimelinePoint(dto: DeliveryTimelinePointApiDto): IDeliveryTimelinePoint {
    return {
        periodStart: parseLocalDate(dto.periodStart),
        deliveriesCount: dto.deliveriesCount,
        quantityTotal: dto.quantityTotal,
    };
}

export function toDeliveryTimeline(dto: DeliveryTimelineApiDto): IDeliveryTimeline {
    return {
        granularity: dto.granularity,
        points: dto.points.map(toDeliveryTimelinePoint),
    };
}

export interface PatientsSummaryApiDto {
    totalCount: number;
    newThisMonthCount: number;
    withoutAccountCount: number;
    pendingRegistrationRequestsCount: number;
}

export interface PrescriptionsSummaryApiDto {
    totalCount: number;
    pendingCount: number;
    canceledCount: number;
    issuedThisMonthCount: number;
}

export interface DeliveriesSummaryApiDto {
    totalCount: number;
    thisMonthCount: number;
    overdueCount: number;
    upcomingCount: number;
}

export interface MedicinesSummaryApiDto {
    totalCount: number;
    newThisMonthCount: number;
    withoutEanCodeCount: number;
    movementsThisMonthCount: number;
}

export interface UsersSummaryApiDto {
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    newThisMonthCount: number;
}

export function toPatientsSummary(dto: PatientsSummaryApiDto): IPatientsSummary {
    return { ...dto };
}

export function toPrescriptionsSummary(dto: PrescriptionsSummaryApiDto): IPrescriptionsSummary {
    return { ...dto };
}

export function toDeliveriesSummary(dto: DeliveriesSummaryApiDto): IDeliveriesSummary {
    return { ...dto };
}

export function toMedicinesSummary(dto: MedicinesSummaryApiDto): IMedicinesSummary {
    return { ...dto };
}

export function toUsersSummary(dto: UsersSummaryApiDto): IUsersSummary {
    return { ...dto };
}
