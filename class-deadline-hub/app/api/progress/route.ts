import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDoneIds } from "@/lib/db";
import { can } from "@/lib/permissions";

/** Danh sách id deadline mà người đang đăng nhập đã đánh dấu xong (dùng cho trang chi tiết ISR). */
export async function GET() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "deadline:mark")) {
    return NextResponse.json({ doneIds: [] }, { status: 401 });
  }
  const doneIds = await getDoneIds(session.user.id);
  return NextResponse.json({ doneIds }, { headers: { "Cache-Control": "private, no-store" } });
}
