"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import type { ProjectRecord } from "@/lib/types";

export function ProjectDirectory({
  records,
  initialDomain,
}: {
  records: ProjectRecord[];
  initialDomain?: string;
}) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState(initialDomain ?? "All domains");
  const domains = [
    "All domains",
    ...Array.from(
      new Set(
        records.map((record) => record.domain).filter((value): value is string => Boolean(value)),
      ),
    ),
  ];
  const filtered = useMemo(
    () =>
      records.filter(
        (project) =>
          `${project.title} ${project.description} ${project.technologies.join(" ")} ${project.domain ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (domain === "All domains" || project.domain === domain),
      ),
    [records, query, domain],
  );
  return (
    <>
      <div className="directory-controls">
        <label className="field" style={{ flex: 1, minWidth: 220 }}>
          <span className="trap">Search projects</span>
          <span style={{ position: "relative" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 13, top: 14, color: "#8996aa" }}
            />
            <input
              aria-label="Search projects"
              placeholder="Search by name or technology"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </span>
        </label>
        <label className="field">
          <span className="trap">Filter by domain</span>
          <select
            aria-label="Filter by domain"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          >
            {domains.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="card-grid">
          {filtered.map((project) => (
            <article className="card project-card" key={project.id}>
              {project.cover_image_url && (
                <Image
                  src={project.cover_image_url}
                  alt=""
                  width={600}
                  height={300}
                  unoptimized
                  className="project-cover-image"
                />
              )}
              <span className="tag">{project.domain || "Community project"}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="card-meta">
                {project.technologies.map((technology) => (
                  <span className="tag" key={technology}>
                    {technology}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 22, display: "flex", gap: 18, flexWrap: "wrap" }}>
                <Link href={`/projects/${project.slug}`} className="text-link">
                  Project details <ArrowUpRight size={13} />
                </Link>
                {project.repository_url && (
                  <a
                    href={project.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    Repository <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No matching projects.</strong>
          {records.length
            ? "Try another search or domain filter."
            : "Published community work will appear here with real repository and demo links when supplied."}
        </div>
      )}
    </>
  );
}
