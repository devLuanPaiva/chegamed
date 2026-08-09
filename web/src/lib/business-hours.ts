const TIME_ZONE = "America/Fortaleza";
const OPENING_HOUR = 8;
const CLOSING_HOUR = 17;
const BUSINESS_DAYS = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);

export const BUSINESS_HOURS_LABEL = "segunda a sexta, das 8h às 17h";

export function isWithinBusinessHours(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");

  return BUSINESS_DAYS.has(weekday) && hour >= OPENING_HOUR && hour < CLOSING_HOUR;
}
