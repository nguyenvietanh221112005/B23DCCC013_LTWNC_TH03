"use client";

import { ErrorPanel } from "@/components/error-panel";
import { BareHeader } from "@/components/site-header";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <BareHeader />
      <main>
        <ErrorPanel error={error} reset={reset} title="Đã có lỗi xảy ra" />
      </main>
    </>
  );
}
