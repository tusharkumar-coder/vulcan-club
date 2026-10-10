import type { MetadataRoute } from "next";
import { getEvents, getProjects, getTeam } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = [
    "",
    "/about",
    "/domains",
    "/events",
    "/leaderboards",
    "/projects",
    "/competitive-programming",
    "/team",
    "/resources",
    "/join",
    "/contact",
    "/privacy",
    "/terms",
  ];
  const [events, projects, team] = await Promise.all([getEvents(), getProjects(), getTeam()]);
  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...events.records.map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...projects.records.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...team.records.map((member) => ({
      url: `${base}/team/${member.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
