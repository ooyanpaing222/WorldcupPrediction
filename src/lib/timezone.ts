export const APP_TIME_ZONE = "Asia/Yangon";
export const APP_TIME_ZONE_LABEL = "MMT";

const MMT_OFFSET_MINUTES = 6 * 60 + 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function localDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value)
  };
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function mmtDateKey(value: string | Date) {
  const parts = localDateParts(value instanceof Date ? value : new Date(value));
  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
}

export function addMmtDays(value: string | Date, days: number) {
  const parts = typeof value === "string"
    ? value.split("-").map((part) => Number(part))
    : [localDateParts(value).year, localDateParts(value).month, localDateParts(value).day];
  const [year, month, day] = parts;
  const shiftedUtcTime = Date.UTC(year, month - 1, day + days) - MMT_OFFSET_MINUTES * 60 * 1000;
  return mmtDateKey(new Date(shiftedUtcTime));
}

export function mmtDayUtcRange(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const start = new Date(Date.UTC(year, month - 1, day) - MMT_OFFSET_MINUTES * 60 * 1000);
  return { start, end: new Date(start.getTime() + MS_PER_DAY) };
}

export function formatMmtDate(value: string | Date, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: APP_TIME_ZONE }).format(value instanceof Date ? value : new Date(value));
}

export function formatMmtDateTime(value: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) {
  return `${new Intl.DateTimeFormat("en", { ...options, timeZone: APP_TIME_ZONE }).format(value instanceof Date ? value : new Date(value))} ${APP_TIME_ZONE_LABEL}`;
}
