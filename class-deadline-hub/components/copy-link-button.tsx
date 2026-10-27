"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, LinkIcon } from "./icons";

/** Nút "Sao chép link": chép URL hiện tại (origin thật của người dùng) vào clipboard. */
export function CopyLinkButton({ path }: { path: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      // Clipboard API cần HTTPS/localhost; thử cách cũ nếu bị chặn.
      try {
        const input = document.createElement("textarea");
        input.value = url;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const ok = document.execCommand("copy");
        input.remove();
        setState(ok ? "copied" : "error");
      } catch {
        setState("error");
      }
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };

  return (
    <>
      <button type="button" className="btn btn--outline btn--lg" onClick={copy}>
        {state === "copied" ? <CheckIcon size={15} /> : <LinkIcon size={15} />}
        {state === "copied" ? "Đã sao chép" : "Sao chép link"}
      </button>
      <span role="status" className={state === "error" ? "field__error" : "sr-only"}>
        {state === "copied" && "Đã sao chép link vào clipboard."}
        {state === "error" && "Không sao chép được, hãy copy từ thanh địa chỉ."}
      </span>
    </>
  );
}
