/** Tiện ích ngày giờ — mọi thứ hiển thị theo giờ Việt Nam. Dùng được ở cả server và client. */

export const TIME_ZONE = "Asia/Ho_Chi_Minh";
const DAY_MS = 24 * 60 * 60 * 1000;

const partsFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

function toDate(date: Date | string) {
  return typeof date === "string" ? new Date(date) : date;
}

function parts(date: Date | string) {
  const p = Object.fromEntries(partsFmt.formatToParts(toDate(date)).map((x) => [x.type, x.value]));
  return { day: p.day, month: p.month, year: p.year, hour: p.hour, minute: p.minute };
}

/** "Thứ Sáu" */
export function weekday(date: Date | string) {
  const p = parts(date);
  return WEEKDAYS[new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay()];
}

/** "30/10/2026" */
export function formatDate(date: Date | string) {
  const p = parts(date);
  return `${p.day}/${p.month}/${p.year}`;
}

/** "23:59" */
export function formatTime(date: Date | string) {
  const p = parts(date);
  return `${p.hour}:${p.minute}`;
}

/** "30/10/2026 23:59" */
export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/** "23:59 · Thứ Sáu, 30/10/2026" */
export function formatDue(date: Date | string) {
  return `${formatTime(date)} · ${weekday(date)}, ${formatDate(date)}`;
}

/** "2026-10-30T23:59" — giá trị cho <input type="datetime-local"> theo giờ VN */
export function toDateTimeLocal(date: Date | string) {
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** { month: "THG 10", day: "30" } cho ô lịch nhỏ */
export function calendarChip(date: Date | string) {
  const p = parts(date);
  return { month: `THG ${p.month}`, day: p.day };
}

/** Số ngày lịch (theo giờ VN) từ `now` tới `due`. Âm nghĩa là đã qua. */
export function calendarDaysBetween(now: Date, due: Date) {
  const a = parts(now);
  const b = parts(due);
  const utcA = Date.UTC(+a.year, +a.month - 1, +a.day);
  const utcB = Date.UTC(+b.year, +b.month - 1, +b.day);
  return Math.round((utcB - utcA) / DAY_MS);
}

export type CountdownTone = "overdue" | "soon" | "normal";

export interface Countdown {
  overdue: boolean;
  days: number;
  label: string;
  tone: CountdownTone;
  /** Phần giờ/phút lẻ, ví dụ "10 giờ 42 phút" */
  detail: string;
}

/** "Còn X ngày" / "Quá hạn Y ngày" — tính theo ngày lịch giờ VN. */
export function getCountdown(dueAt: string | Date, now: Date = new Date()): Countdown {
  const due = toDate(dueAt);
  const diff = due.getTime() - now.getTime();
  const overdue = diff < 0;
  const days = Math.abs(calendarDaysBetween(now, due));

  const abs = Math.abs(diff);
  const hours = Math.floor((abs % DAY_MS) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const detail = `${hours} giờ ${minutes} phút`;

  if (overdue) {
    return {
      overdue,
      days,
      label: days === 0 ? "Quá hạn hôm nay" : `Quá hạn ${days} ngày`,
      tone: "overdue",
      detail: `Đã trễ ${Math.floor(abs / DAY_MS)} ngày ${detail}`,
    };
  }
  return {
    overdue,
    days,
    label: days === 0 ? "Hết hạn hôm nay" : `Còn ${days} ngày`,
    tone: days <= 3 ? "soon" : "normal",
    detail,
  };
}
