"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { ResourceRecord } from "@/lib/types";

export function ResourceDirectory({ records }: { records: ResourceRecord[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const categories = [
    "All categories",
    ...Array.from(new Set(records.map((record) => record.category))),
  ];
  const filtered = useMemo(
    () =>
      records.filter(
        (item) =>
          `${item.title} ${item.description} ${item.tags.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "All categories" || category === item.category),
      ),
    [records, query, category],
  );
  return (
    <>
      <div className="directory-controls">
        <label className="field" style={{ flex: 1, minWidth: 220 }}>
          <span className="trap">Search resources</span>
          <span style={{ position: "relative" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 13, top: 14, color: "#8996aa" }}
            />
            <input
              aria-label="Search resources"
              placeholder="Search guides, tools, topics"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </span>
        </label>
        <label className="field">
          <span className="trap">Category</span>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="resource-grid">
          {filtered.map((item) => (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="resource-link"
              key={item.id}
            >
              <span>
                {item.title}
                <small>{item.description}</small>
                <span className="card-meta">
                  {item.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
              <ExternalLink size={15} />
            </a>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No matching resources.</strong>
          {records.length
            ? "Try another keyword or category."
            : "Published notes and useful links will appear here."}
        </div>
      )}
    </>
  );
}
