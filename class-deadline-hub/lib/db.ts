import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Deadline, DeadlineWithSubject, ProgressMap, Subject, UserRecord } from "./types";

/**
 * "Cơ sở dữ liệu" là các file JSON trong thư mục data/.
 * Trên Vercel hệ thống file chỉ đọc, nên dữ liệu ghi được đặt ở /tmp
 * (chỉ phục vụ demo — không bền vững giữa các instance).
 */
const SEED_DIR = path.join(process.cwd(), "data");
const WRITE_DIR = process.env.VERCEL ? path.join("/tmp", "class-deadline-hub") : SEED_DIR;

async function readJson<T>(file: string): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(WRITE_DIR, file), "utf8")) as T;
  } catch (err) {
    if (WRITE_DIR === SEED_DIR) throw err;
    return JSON.parse(await fs.readFile(path.join(SEED_DIR, file), "utf8")) as T;
  }
}

// Ghi tuần tự để hai request đồng thời không ghi đè lẫn nhau.
let writeQueue: Promise<unknown> = Promise.resolve();

function writeJson(file: string, data: unknown) {
  const run = async () => {
    await fs.mkdir(WRITE_DIR, { recursive: true });
    const target = path.join(WRITE_DIR, file);
    const tmp = `${target}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
    await fs.rename(tmp, target);
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => undefined);
  return next;
}

/* ---------- Môn học ---------- */

export async function getSubjects(): Promise<Subject[]> {
  return readJson<Subject[]>("subjects.json");
}

export async function getSubject(slug: string): Promise<Subject | undefined> {
  return (await getSubjects()).find((s) => s.slug === slug);
}

/* ---------- Deadline ---------- */

const byDue = (a: Deadline, b: Deadline) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();

async function attachSubjects(list: Deadline[]): Promise<DeadlineWithSubject[]> {
  const map = new Map((await getSubjects()).map((s) => [s.slug, s]));
  return list.flatMap((d) => {
    const subject = map.get(d.subjectSlug);
    return subject ? [{ ...d, subject }] : [];
  });
}

/** Sắp xếp theo hạn nộp gần nhất. */
export async function getDeadlines(): Promise<DeadlineWithSubject[]> {
  const list = await readJson<Deadline[]>("deadlines.json");
  return attachSubjects([...list].sort(byDue));
}

/** Theo thứ tự id (trang quản trị). */
export async function getDeadlinesById(): Promise<DeadlineWithSubject[]> {
  const list = await readJson<Deadline[]>("deadlines.json");
  return attachSubjects([...list].sort((a, b) => a.id - b.id));
}

export async function getDeadline(id: number): Promise<DeadlineWithSubject | undefined> {
  const list = await readJson<Deadline[]>("deadlines.json");
  const found = list.find((d) => d.id === id);
  return found ? (await attachSubjects([found]))[0] : undefined;
}

export async function getDeadlinesBySubject(slug: string): Promise<DeadlineWithSubject[]> {
  return (await getDeadlines()).filter((d) => d.subjectSlug === slug);
}

export async function createDeadline(input: Omit<Deadline, "id">): Promise<Deadline> {
  const list = await readJson<Deadline[]>("deadlines.json");
  const id = list.reduce((max, d) => Math.max(max, d.id), 0) + 1;
  const created: Deadline = { id, ...input };
  await writeJson("deadlines.json", [...list, created]);
  return created;
}

/** Trả về deadline đã xoá (để revalidate đúng trang môn học), hoặc undefined nếu không có. */
export async function deleteDeadline(id: number): Promise<Deadline | undefined> {
  const list = await readJson<Deadline[]>("deadlines.json");
  const removed = list.find((d) => d.id === id);
  if (!removed) return undefined;
  await writeJson(
    "deadlines.json",
    list.filter((d) => d.id !== id),
  );

  // Dọn tiến độ của mọi người dùng trỏ tới deadline đã xoá.
  const progress = await readJson<ProgressMap>("progress.json");
  for (const userId of Object.keys(progress)) {
    progress[userId] = progress[userId].filter((x) => x !== id);
  }
  await writeJson("progress.json", progress);
  return removed;
}

/* ---------- Người dùng ---------- */

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const users = await readJson<UserRecord[]>("users.json");
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/* ---------- Tiến độ (đã xong) ---------- */

export async function getDoneIds(userId: string): Promise<number[]> {
  const progress = await readJson<ProgressMap>("progress.json");
  return progress[userId] ?? [];
}

export async function setDone(userId: string, deadlineId: number, done: boolean): Promise<number[]> {
  const progress = await readJson<ProgressMap>("progress.json");
  const current = new Set(progress[userId] ?? []);
  if (done) current.add(deadlineId);
  else current.delete(deadlineId);
  progress[userId] = [...current].sort((a, b) => a - b);
  await writeJson("progress.json", progress);
  return progress[userId];
}
