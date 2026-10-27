import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label={`${SITE_NAME} — Trang chủ`}>
      <Image src="/logo.svg" alt="" width={28} height={28} priority />
      <span>{SITE_NAME}</span>
    </Link>
  );
}
