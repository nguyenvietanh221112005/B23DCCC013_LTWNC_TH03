import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { formatDate, formatTime, getCountdown, weekday } from "@/lib/date";
import { getDeadline } from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

export const alt = "Ảnh chia sẻ deadline — Class Deadline Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Ảnh chứa "Còn X ngày" nên làm mới mỗi giờ để con số không quá cũ.
export const revalidate = 3600;

const FONT_DIR = path.join(process.cwd(), "assets/fonts");

/** Satori cần font TTF đầy đủ dấu tiếng Việt (Be Vietnam Pro, giấy phép OFL) — đóng gói sẵn trong assets/fonts. */
async function loadFonts() {
  const files = [
    { weight: 400, file: "BeVietnamPro-Regular.ttf" },
    { weight: 700, file: "BeVietnamPro-Bold.ttf" },
    { weight: 800, file: "BeVietnamPro-ExtraBold.ttf" },
  ] as const;
  return Promise.all(
    files.map(async ({ weight, file }) => ({
      name: "Be Vietnam Pro",
      weight,
      style: "normal" as const,
      data: await readFile(path.join(FONT_DIR, file)),
    })),
  );
}

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deadline = /^\d{1,9}$/.test(id) ? await getDeadline(Number(id)) : undefined;
  const fonts = await loadFonts();

  const accent = deadline?.subject.color ?? "#2f45d8";
  const c = deadline ? getCountdown(deadline.dueAt) : null;
  const badgeBg = c?.tone === "overdue" ? "#e5484d" : c?.tone === "soon" ? "#fdd34d" : "#e7e9ee";
  const badgeFg = c?.tone === "overdue" ? "#ffffff" : c?.tone === "soon" ? "#3d2600" : "#12141a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#12141a",
          color: "#ffffff",
          fontFamily: "Be Vietnam Pro",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -150,
            top: -170,
            width: 560,
            height: 560,
            borderRadius: 9999,
            border: `72px solid ${accent}`,
            opacity: 0.45,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: accent,
              borderRadius: 9999,
              padding: "10px 26px",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <div style={{ width: 12, height: 12, background: "#fff", borderRadius: 3 }} />
            {deadline?.subject.name ?? SITE_NAME}
          </div>
          {deadline && <div style={{ fontSize: 28, color: "#9aa0ae", fontWeight: 700 }}>{`Deadline #${deadline.id}`}</div>}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: deadline && deadline.title.length > 48 ? 60 : 74,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: -1.5,
            maxWidth: 1000,
          }}
        >
          {deadline?.title ?? "Không tìm thấy deadline"}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {deadline && c ? (
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <div
                style={{
                  display: "flex",
                  background: badgeBg,
                  color: badgeFg,
                  borderRadius: 14,
                  padding: "14px 28px",
                  fontSize: 38,
                  fontWeight: 800,
                }}
              >
                {c.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", fontSize: 28, lineHeight: 1.35 }}>
                <div style={{ fontWeight: 700 }}>{`${formatTime(deadline.dueAt)} · ${weekday(deadline.dueAt)}`}</div>
                <div style={{ color: "#9aa0ae" }}>{formatDate(deadline.dueAt)}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", fontSize: 30, color: "#9aa0ae" }}>Xem danh sách deadline của lớp</div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 46,
                height: 46,
                borderRadius: 10,
                background: "#ffffff",
                color: "#12141a",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              CD
            </div>
            {SITE_NAME}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
