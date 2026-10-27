import Link from "next/link";
import type { Subject } from "@/lib/types";

export function subjectTint(color: string) {
  return { background: `${color}14`, color };
}

export function SubjectCard({ subject, count }: { subject: Subject; count: number }) {
  return (
    <Link href={`/subjects/${subject.slug}`} className="card subject-card">
      <span className="subject-code" style={subjectTint(subject.color)}>
        {subject.code}
      </span>
      <span className="subject-card__name">{subject.name}</span>
      <span className="subject-card__desc">{subject.description}</span>
      <span className="subject-card__count" style={{ color: subject.color }}>
        {count} deadline →
      </span>
    </Link>
  );
}
