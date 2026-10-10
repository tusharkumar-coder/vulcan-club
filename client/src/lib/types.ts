export type EventRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  starts_at: string;
  ends_at?: string | null;
  venue?: string | null;
  registration_deadline?: string | null;
  registration_url?: string | null;
  cover_image_url?: string | null;
  status: "draft" | "published" | "archived";
};

export type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  domain?: string | null;
  technologies: string[];
  contributors: string[];
  repository_url?: string | null;
  demo_url?: string | null;
  cover_image_url?: string | null;
  status: "draft" | "published" | "archived";
};

export type ResourceRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
};

export type DomainRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  technologies: string[];
  roadmap: unknown[];
  is_published: boolean;
  sort_order: number;
};

export type TeamMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio?: string | null;
  interests: string[];
  skills?: string[] | null;
  image_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
};

export type LeaderboardEntry = {
  id: string;
  contest_name: string;
  contest_date: string;
  student_name: string;
  academic_year: "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "Other";
  points: number;
  status: "draft" | "published" | "archived";
};

export type DataResult<T> = {
  records: T[];
  source: "supabase" | "demo" | "empty" | "error";
  message?: string;
};
