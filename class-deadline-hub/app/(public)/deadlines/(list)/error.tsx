"use client";

import { ErrorPanel } from "@/components/error-panel";

export default function DeadlinesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorPanel error={error} reset={reset} title="Không tải được danh sách deadline" />;
}
