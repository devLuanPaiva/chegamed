package com.devluanpaiva.controle_de_remedios.shared.utils;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class BusinessHoursValidator {
    private static final ZoneId ZONE = ZoneId.of("America/Fortaleza");
    private static final LocalTime OPENING_TIME = LocalTime.of(8, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(17, 0);

    private BusinessHoursValidator() {
    }

    public static boolean isWithinBusinessHours() {
        return isWithinBusinessHours(ZonedDateTime.now(ZONE));
    }

    public static boolean isWithinBusinessHours(ZonedDateTime dateTime) {
        DayOfWeek dayOfWeek = dateTime.getDayOfWeek();
        LocalTime time = dateTime.toLocalTime();

        boolean isBusinessDay = dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
        boolean isBusinessTime = !time.isBefore(OPENING_TIME) && time.isBefore(CLOSING_TIME);

        return isBusinessDay && isBusinessTime;
    }
}
