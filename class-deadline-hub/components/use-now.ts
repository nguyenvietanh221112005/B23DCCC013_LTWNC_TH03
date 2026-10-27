"use client";

import { useSyncExternalStore } from "react";

/**
 * Thời điểm hiện tại, dùng chung một bộ đếm cho mọi component.
 * Ở server (và lúc hydrate) trả về null → HTML tĩnh không chứa số ngày "cũ" bị lệch.
 */
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  now = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(tick, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useNow(): number | null {
  return useSyncExternalStore<number | null>(
    subscribe,
    () => now,
    () => null,
  );
}
