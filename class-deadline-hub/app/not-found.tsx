import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found-view";
import { BareHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <BareHeader />
      <main>
        <NotFoundView />
      </main>
    </>
  );
}
