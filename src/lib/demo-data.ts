import type { EventRecord, ProjectRecord, ResourceRecord, TeamMember } from "@/lib/types";

// Fictional records for local visual QA only. They are gated behind USE_DEMO_DATA=true.
export const demoEvents: EventRecord[] = [
  {
    id: "demo-event-1",
    title: "Build Night: Ship a Tiny Tool",
    slug: "build-night-tiny-tool",
    description:
      "A guided evening to turn one small idea into a useful, working tool. Bring a laptop and curiosity.",
    category: "Build session",
    starts_at: "2026-11-14T16:00:00+05:30",
    venue: "Mirai School of Technology · Studio 02",
    registration_deadline: "2026-11-13T23:59:00+05:30",
    status: "published",
  },
  {
    id: "demo-event-2",
    title: "Algorithms in the Wild",
    slug: "algorithms-in-the-wild",
    description:
      "A practice session on graph problems, trade-offs, and explaining your reasoning clearly.",
    category: "Study group",
    starts_at: "2026-11-20T17:30:00+05:30",
    venue: "Online · meeting details after registration",
    status: "published",
  },
  {
    id: "demo-event-3",
    title: "Open Source First Contribution Clinic",
    slug: "open-source-clinic",
    description:
      "Learn how to find a welcoming issue, understand a codebase, and send a thoughtful first pull request.",
    category: "Workshop",
    starts_at: "2026-12-03T15:00:00+05:30",
    venue: "Mirai School of Technology · Lab 04",
    status: "published",
  },
];

export const demoProjects: ProjectRecord[] = [
  {
    id: "demo-project-1",
    title: "Orbit Notes",
    slug: "orbit-notes",
    description:
      "A local-first study journal concept that connects notes, code snippets, and the questions that led to them.",
    domain: "Web Development",
    technologies: ["TypeScript", "Next.js", "SQLite"],
    contributors: ["Demo contributor"],
    repository_url: null,
    demo_url: null,
    status: "published",
  },
  {
    id: "demo-project-2",
    title: "Queue Zero",
    slug: "queue-zero",
    description:
      "A small queue visualizer for exploring scheduling policies and their real-world trade-offs.",
    domain: "Systems & Developer Tools",
    technologies: ["Rust", "WASM", "D3"],
    contributors: ["Demo contributor"],
    repository_url: null,
    demo_url: null,
    status: "published",
  },
  {
    id: "demo-project-3",
    title: "Patchwork",
    slug: "patchwork",
    description:
      "A guided contribution map that helps newcomers move from a good first issue to a useful code review.",
    domain: "Open Source",
    technologies: ["React", "PostgreSQL", "GitHub API"],
    contributors: ["Demo contributor"],
    repository_url: null,
    demo_url: null,
    status: "published",
  },
];

export const demoResources: ResourceRecord[] = [
  {
    id: "demo-resource-1",
    title: "A calm start with Git",
    slug: "calm-start-git",
    description:
      "A short, practical guide to branches, commits, pull requests, and recovering from common mistakes.",
    category: "Open source",
    url: "https://git-scm.com/docs",
    tags: ["Git", "Foundations"],
  },
  {
    id: "demo-resource-2",
    title: "Graph patterns, explained",
    slug: "graph-patterns",
    description:
      "A curated route through graph traversal, shortest paths, and common contest patterns.",
    category: "Competitive programming",
    url: "https://cp-algorithms.com/",
    tags: ["DSA", "Graphs"],
  },
];

export const demoTeam: TeamMember[] = [
  {
    id: "demo-member-1",
    slug: "preview-profile",
    name: "Preview profile",
    role: "Example organizer",
    bio: "This fictional profile shows how organizer details will appear once the team is added.",
    interests: ["Community building", "Open source"],
    skills: ["Community building", "Open source"],
  },
];
