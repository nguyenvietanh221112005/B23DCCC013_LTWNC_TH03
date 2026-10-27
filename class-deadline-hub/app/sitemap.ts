import type { MetadataRoute } from "next";
import { getDeadlines, getSubjects } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

// Được revalidate on-demand trong Server Action khi admin thêm/xoá deadline.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [deadlines, subjects] = await Promise.all([getDeadlines(), getSubjects()]);
  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/deadlines"), lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/subjects"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...subjects.map((s) => ({
      url: absoluteUrl(`/subjects/${s.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...deadlines.map((d) => ({
      url: absoluteUrl(`/deadlines/${d.id}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
