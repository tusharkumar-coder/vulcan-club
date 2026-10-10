"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, CalendarDays, Search } from "lucide-react";
import type { EventRecord } from "@/lib/types";

const subscribeClock = (notify: () => void) => {
  const timer = setInterval(notify, 60_000);
  return () => clearInterval(timer);
};
const getCurrentTime = () => Date.now();

export function EventDirectory({ records }: { records: EventRecord[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All types");
  const [period, setPeriod] = useState("Upcoming");
  const referenceNow = useSyncExternalStore(subscribeClock, getCurrentTime, () => 0);
  const categories = [
    "All types",
    ...Array.from(new Set(records.map((record) => record.category))),
  ];
  const filtered = useMemo(
    () =>
      records.filter((event) => {
        const text =
          `${event.title} ${event.description} ${event.category} ${event.venue ?? ""}`.toLowerCase();
        const upcoming = new Date(event.starts_at).getTime() >= referenceNow;
        return (
          text.includes(query.toLowerCase()) &&
          (category === "All types" || event.category === category) &&
          (period === "All" || (period === "Upcoming" ? upcoming : !upcoming))
        );
      }),
    [records, query, category, period, referenceNow],
  );
  return (
    <>
      <div className="directory-controls">
        <label className="field" style={{ flex: 1, minWidth: 210 }}>
          <span className="trap">Search events</span>
          <span style={{ position: "relative" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 13, top: 14, color: "#8996aa" }}
            />
            <input
              aria-label="Search events"
              placeholder="Search events, topics, places"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </span>
        </label>
        <label className="field">
          <span className="trap">Event type</span>
          <select
            aria-label="Filter event type"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="segmented" role="group" aria-label="Event date filter">
          {["Upcoming", "Past", "All"].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={period === item}
              onClick={() => setPeriod(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <div className="card-grid">
          {filtered.map((event) => {
            const date = new Date(event.starts_at);
            return (
              <Link href={`/events/${event.slug}`} className="card" key={event.id}>
                {event.cover_image_url && (
                  <Image
                    src={event.cover_image_url}
                    alt=""
                    width={120}
                    height={120}
                    unoptimized
                    className="event-cover"
                  />
                )}
                <div className="event-date">
                  <CalendarDays size={12} style={{ display: "inline", marginRight: 6 }} />
                  {date.toLocaleDateString("en", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}{" "}
                  · {date.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                </div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="card-meta">
                  <span className="tag tag-orange">{event.category}</span>
                  {event.venue && <span className="tag">{event.venue}</span>}
                </div>
                <div style={{ marginTop: 22 }} className="text-link">
                  Event details <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No matching events.</strong>
          {records.length
            ? "Try another search or date filter."
            : "Published workshops, contests, and study groups will appear here."}
        </div>
      )}
    </>
  );
}
