import { Braces, Cpu, GitBranch, Layers3, Rocket, Terminal, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Domain = {
  number: string;
  title: string;
  short: string;
  description: string;
  tools: string[];
  route: string;
  icon: LucideIcon;
};
export const domains: Domain[] = [
  {
    number: "01",
    title: "Competitive programming & DSA",
    short: "Think in constraints.",
    description:
      "Build fluency with data structures, algorithms, and the habit of turning a hard problem into a clear plan.",
    tools: ["C++", "Python", "Problem solving"],
    route: "/competitive-programming",
    icon: Trophy,
  },
  {
    number: "02",
    title: "Web development",
    short: "Make ideas usable.",
    description:
      "Design and ship thoughtful web experiences, from interaction and accessibility to APIs and deployment.",
    tools: ["TypeScript", "React", "Next.js"],
    route: "/domains",
    icon: Braces,
  },
  {
    number: "03",
    title: "AI & machine learning",
    short: "Build with evidence.",
    description:
      "Explore machine learning through careful experiments, useful data pipelines, and responsible product thinking.",
    tools: ["Python", "PyTorch", "Data"],
    route: "/domains",
    icon: Cpu,
  },
  {
    number: "04",
    title: "Open source",
    short: "Learn in the open.",
    description:
      "Understand real codebases, make maintainable contributions, and help useful software get better.",
    tools: ["Git", "GitHub", "Community"],
    route: "/domains",
    icon: GitBranch,
  },
  {
    number: "05",
    title: "App development",
    short: "Design for the hand.",
    description:
      "Create mobile and cross-platform tools with attention to speed, accessible interfaces, and real user needs.",
    tools: ["Kotlin", "Swift", "React Native"],
    route: "/domains",
    icon: Layers3,
  },
  {
    number: "06",
    title: "Systems & developer tools",
    short: "Know what’s underneath.",
    description:
      "Explore operating systems, networks, compilers, cloud infrastructure, and tools that improve how we build.",
    tools: ["Linux", "Rust", "Cloud"],
    route: "/domains",
    icon: Terminal,
  },
  {
    number: "07",
    title: "Hackathons & product building",
    short: "From idea to demo.",
    description:
      "Work across disciplines to frame a problem, prototype a solution, and make the value visible.",
    tools: ["Prototyping", "Teamwork", "Iteration"],
    route: "/events",
    icon: Rocket,
  },
];
