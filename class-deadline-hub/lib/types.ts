import type { AuthRole } from "./permissions";

export interface Subject {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
}

export interface Deadline {
  id: number;
  subjectSlug: string;
  title: string;
  /** ISO 8601 có múi giờ, ví dụ 2026-10-30T23:59:00+07:00 */
  dueAt: string;
  description: string;
}

export interface DeadlineWithSubject extends Deadline {
  subject: Subject;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  passwordHash: string;
}

/** userId → danh sách id deadline đã xong */
export type ProgressMap = Record<string, number[]>;
