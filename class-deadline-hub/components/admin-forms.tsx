"use client";

import { useActionState, useState, useTransition } from "react";
import { createDeadlineAction, deleteDeadlineAction, type CreateDeadlineState } from "@/lib/actions";
import type { Subject } from "@/lib/types";

const initial: CreateDeadlineState = { status: "idle" };

export function CreateDeadlineForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, pending] = useActionState(createDeadlineAction, initial);
  const errors = state.fieldErrors ?? {};
  const values = state.values;

  // React 19 tự reset form sau action, về defaultValue mới (giữ lại dữ liệu khi lỗi, xoá trắng khi thành công).

  return (
    <form action={formAction} className="form" noValidate>
      {state.message && (
        <p role="status" className={`notice ${state.status === "success" ? "notice--success" : "notice--error"}`} style={{ marginTop: 0 }}>
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="title">Tên deadline</label>
        <input
          id="title"
          name="title"
          className="input"
          placeholder="VD: Bài tập Buổi 9 – Testing"
          defaultValue={values?.title}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? "title-error" : undefined}
          required
          maxLength={120}
        />
        {errors.title && <p id="title-error" className="field__error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="subjectSlug">Môn học</label>
        <select
          id="subjectSlug"
          name="subjectSlug"
          className="input"
          defaultValue={values?.subjectSlug ?? subjects[0]?.slug}
          aria-invalid={errors.subjectSlug ? true : undefined}
        >
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.subjectSlug && <p className="field__error">{errors.subjectSlug}</p>}
      </div>

      <div className="field">
        <label htmlFor="dueAt">Hạn nộp</label>
        <input
          id="dueAt"
          name="dueAt"
          type="datetime-local"
          className="input"
          defaultValue={values?.dueAt}
          aria-invalid={errors.dueAt ? true : undefined}
          aria-describedby={errors.dueAt ? "due-error" : undefined}
          required
        />
        {errors.dueAt && <p id="due-error" className="field__error">{errors.dueAt}</p>}
      </div>

      <div className="field">
        <label htmlFor="description">
          Mô tả <span className="optional">(không bắt buộc)</span>
        </label>
        <textarea
          id="description"
          name="description"
          className="input"
          rows={3}
          maxLength={1000}
          defaultValue={values?.description}
          aria-invalid={errors.description ? true : undefined}
        />
        {errors.description && <p className="field__error">{errors.description}</p>}
      </div>

      <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending}>
        {pending ? "Đang thêm…" : "Thêm deadline"}
      </button>
    </form>
  );
}

export function DeleteDeadlineButton({ id, title }: { id: number; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (!window.confirm(`Xoá deadline #${id} “${title}”?`)) return;
    startTransition(async () => {
      const res = await deleteDeadlineAction(id);
      if (!res.ok) setError(res.error);
    });
  };

  return (
    <>
      <button type="button" className="btn btn--danger-outline" onClick={onClick} disabled={pending} aria-label={`Xoá ${title}`}>
        {pending ? "…" : "Xoá"}
      </button>
      {error && <span role="alert" className="field__error" style={{ display: "block" }}>{error}</span>}
    </>
  );
}
