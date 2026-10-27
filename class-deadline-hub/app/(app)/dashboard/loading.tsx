export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải dashboard…</span>
      <div className="skeleton" style={{ width: 180, height: 26 }} />
      <div className="skeleton" style={{ width: 300, height: 12, marginTop: 10 }} />
      <div className="card" style={{ marginTop: 16 }}>
        {[60, 45, 70, 52, 38].map((w, i) => (
          <div key={i} className="task">
            <span className="skeleton" style={{ width: 18, height: 18 }} />
            <span className="task__body" style={{ display: "grid", gap: 6 }}>
              <span className="skeleton" style={{ width: `${w}%`, height: 12 }} />
              <span className="skeleton" style={{ width: 140, height: 9 }} />
            </span>
            <span className="skeleton" style={{ width: 84, height: 24, borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
