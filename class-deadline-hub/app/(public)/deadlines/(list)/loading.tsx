/** Skeleton hiển thị ngay khi điều hướng tới /deadlines trong lúc server chuẩn bị dữ liệu. */
export default function Loading() {
  return (
    <div className="container page" aria-busy="true" aria-live="polite">
      <p className="muted" style={{ fontSize: 13 }}>
        Đang tải deadline…
      </p>
      <div className="skeleton" style={{ width: 240, height: 28, marginTop: 14 }} />
      <div className="skeleton" style={{ height: 76, marginTop: 20, borderRadius: 14 }} />
      <ul className="deadline-list" style={{ marginTop: 16 }}>
        {[62, 50, 70, 54, 40, 58].map((w, i) => (
          <li key={i} className="card deadline-row">
            <span className="skeleton" style={{ width: 48, height: 46, borderRadius: 9 }} />
            <span className="deadline-row__body" style={{ display: "grid", gap: 8 }}>
              <span className="skeleton" style={{ width: 110, height: 9 }} />
              <span className="skeleton" style={{ width: `${w}%`, height: 12 }} />
              <span className="skeleton" style={{ width: 150, height: 9 }} />
            </span>
            <span className="skeleton" style={{ width: 84, height: 24, borderRadius: 999 }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
