"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { can, type Action } from "./permissions";
import { createDeadline, deleteDeadline, getDeadline, getSubjects, setDone } from "./db";

/** Mỗi Server Action tự kiểm tra quyền — không giả định middleware đã chặn. */
async function authorize(action: Action) {
  const session = await auth();
  if (!session?.user || !can(session.user.role, action)) return null;
  return session.user;
}

/** Làm mới các trang tĩnh bị ảnh hưởng khi danh sách deadline thay đổi (on-demand). */
function revalidateDeadlinePages(id: number, subjectSlug: string) {
  revalidatePath(`/deadlines/${id}`); // ISR on-demand — yêu cầu "làm mới ngay"
  revalidatePath("/"); // SSG: trang chủ có "Sắp đến hạn"
  revalidatePath("/subjects");
  revalidatePath(`/subjects/${subjectSlug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/dashboard", "layout");
  // /deadlines KHÔNG revalidate ở đây: route này dùng ISR theo thời gian (60 giây).
}

/* ---------- Đánh dấu đã xong ---------- */

const toggleSchema = z.object({
  deadlineId: z.number().int().positive(),
  done: z.boolean(),
});

export type ToggleResult = { ok: true; done: boolean } | { ok: false; error: string };

export async function toggleDoneAction(deadlineId: number, done: boolean): Promise<ToggleResult> {
  const user = await authorize("deadline:mark");
  if (!user) return { ok: false, error: "Bạn cần đăng nhập để đánh dấu deadline." };

  const parsed = toggleSchema.safeParse({ deadlineId, done });
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  if (!(await getDeadline(parsed.data.deadlineId))) {
    return { ok: false, error: "Deadline không tồn tại hoặc đã bị xoá." };
  }

  await setDone(user.id, parsed.data.deadlineId, parsed.data.done);
  revalidatePath("/dashboard", "layout");
  return { ok: true, done: parsed.data.done };
}

/* ---------- Thêm deadline ---------- */

export interface CreateDeadlineState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<"title" | "subjectSlug" | "dueAt" | "description", string>>;
  values?: { title: string; subjectSlug: string; dueAt: string; description: string };
}

const createSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Tên deadline cần ít nhất 3 ký tự.")
    .max(120, "Tên deadline tối đa 120 ký tự."),
  subjectSlug: z.string().min(1, "Hãy chọn môn học."),
  dueAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Hạn nộp không hợp lệ.")
    // Giá trị datetime-local được hiểu theo giờ Việt Nam.
    .transform((v) => `${v}:00+07:00`)
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Hạn nộp không hợp lệ.")
    .refine((v) => new Date(v).getTime() > Date.now(), "Hạn nộp phải sau thời điểm hiện tại."),
  description: z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự."),
});

export async function createDeadlineAction(
  _prev: CreateDeadlineState,
  formData: FormData,
): Promise<CreateDeadlineState> {
  const values = {
    title: String(formData.get("title") ?? ""),
    subjectSlug: String(formData.get("subjectSlug") ?? ""),
    dueAt: String(formData.get("dueAt") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const user = await authorize("deadline:create");
  if (!user) return { status: "error", message: "Chỉ lớp trưởng mới được thêm deadline.", values };

  const parsed = createSchema.safeParse(values);
  const subjects = await getSubjects();
  const fieldErrors: CreateDeadlineState["fieldErrors"] = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<CreateDeadlineState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
  }
  if (!subjects.some((s) => s.slug === values.subjectSlug)) {
    fieldErrors.subjectSlug = "Môn học không tồn tại.";
  }
  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại thông tin.", fieldErrors, values };
  }

  const created = await createDeadline({
    title: parsed.data.title,
    subjectSlug: parsed.data.subjectSlug,
    dueAt: parsed.data.dueAt,
    description: parsed.data.description,
  });
  revalidateDeadlinePages(created.id, created.subjectSlug);

  return {
    status: "success",
    message: `Đã thêm deadline #${created.id}.`,
    values: { title: "", subjectSlug: values.subjectSlug, dueAt: "", description: "" },
  };
}

/* ---------- Xoá deadline ---------- */

export type DeleteResult = { ok: true } | { ok: false; error: string };

export async function deleteDeadlineAction(deadlineId: number): Promise<DeleteResult> {
  const user = await authorize("deadline:delete");
  if (!user) return { ok: false, error: "Chỉ lớp trưởng mới được xoá deadline." };

  const parsed = z.number().int().positive().safeParse(deadlineId);
  if (!parsed.success) return { ok: false, error: "Id không hợp lệ." };

  const removed = await deleteDeadline(parsed.data);
  if (!removed) return { ok: false, error: "Deadline không tồn tại hoặc đã bị xoá." };

  revalidateDeadlinePages(removed.id, removed.subjectSlug);
  return { ok: true };
}
