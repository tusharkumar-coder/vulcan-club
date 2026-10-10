"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Award, CalendarDays, Download, Search, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/types";

const years: LeaderboardEntry["academic_year"][] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Other",
];

const contestKey = (entry: LeaderboardEntry) =>
  `${entry.contest_name.trim().toLocaleLowerCase()}::${entry.contest_date.slice(0, 10)}`;
const formatDate = (value: string) =>
  new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function LeaderboardDirectory({ entries }: { entries: LeaderboardEntry[] }) {
  const [view, setView] = useState<"contest" | "year">("contest");
  const [selectedYear, setSelectedYear] = useState<LeaderboardEntry["academic_year"]>(years[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const contests = useMemo(() => {
    const unique = new Map<string, LeaderboardEntry>();
    for (const entry of entries) unique.set(contestKey(entry), entry);
    return [...unique.entries()]
      .map(([key, entry]) => ({ key, name: entry.contest_name, date: entry.contest_date }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries]);
  const [selectedContest, setSelectedContest] = useState("");
  const activeContest = contests.some((contest) => contest.key === selectedContest)
    ? selectedContest
    : (contests[0]?.key ?? "");

  const contestRows = useMemo(
    () =>
      entries
        .filter((entry) => contestKey(entry) === activeContest)
        .sort(
          (a, b) =>
            Number(b.points) - Number(a.points) || a.student_name.localeCompare(b.student_name),
        ),
    [entries, activeContest],
  );
  const yearRows = useMemo(() => {
    const totals = new Map<
      string,
      {
        name: string;
        year: LeaderboardEntry["academic_year"];
        points: number;
        contests: Set<string>;
      }
    >();
    for (const entry of entries) {
      if (entry.academic_year !== selectedYear) continue;
      const key = entry.student_name.trim().toLocaleLowerCase();
      const existing = totals.get(key) ?? {
        name: entry.student_name.trim(),
        year: entry.academic_year,
        points: 0,
        contests: new Set<string>(),
      };
      existing.points += Number(entry.points);
      existing.contests.add(contestKey(entry));
      totals.set(key, existing);
    }
    return [...totals.values()].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  }, [entries, selectedYear]);

  const activeRawRows = useMemo(() => {
    if (view === "contest") {
      return contestRows.map((entry) => ({
        name: entry.student_name,
        year: entry.academic_year,
        points: Number(entry.points),
        detail: "",
      }));
    }
    return yearRows.map((row) => ({
      name: row.name,
      year: row.year,
      points: row.points,
      detail: `${row.contests.size} ${row.contests.size === 1 ? "contest" : "contests"}`,
    }));
  }, [view, contestRows, yearRows]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return activeRawRows;
    const q = searchQuery.toLowerCase().trim();
    return activeRawRows.filter((row) => row.name.toLowerCase().includes(q));
  }, [activeRawRows, searchQuery]);

  const handleExportCsv = () => {
    const headers = ["Rank", "Student", "Year", "Scope", "Points"];
    const lines = [headers.join(",")];
    filteredRows.forEach((row, index) => {
      lines.push(
        [
          index + 1,
          `"${row.name.replaceAll('"', '""')}"`,
          `"${row.year}"`,
          `"${row.detail || "This contest"}"`,
          row.points,
        ].join(","),
      );
    });
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vulcan-standings-${view}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!entries.length) {
    return (
      <div className="leaderboard-empty">
        <Trophy size={24} aria-hidden="true" />
        <strong>Results will appear here.</strong>
        <p>
          Once organizers publish contest standings, you can explore the rankings by contest or
          year.
        </p>
      </div>
    );
  }

  return (
    <div className="leaderboard-directory">
      <div className="leaderboard-intro">
        <div>
          <span className="eyebrow mono">Vulcan / Standings</span>
          <h2 className="section-heading">Track performance across contests</h2>
        </div>
        <p>Year-wise totals add up organizer-awarded points from published contests.</p>
      </div>

      <div className="leaderboard-view-tabs" role="tablist" aria-label="Leaderboard view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "contest"}
          className={view === "contest" ? "active" : ""}
          onClick={() => {
            setView("contest");
            setSearchQuery("");
          }}
        >
          <Trophy size={15} /> Contest-wise
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "year"}
          className={view === "year" ? "active" : ""}
          onClick={() => {
            setView("year");
            setSearchQuery("");
          }}
        >
          <ArrowDownUp size={15} /> Year-wise
        </button>
      </div>

      {view === "contest" ? (
        <div className="leaderboard-filter-row">
          <label className="field">
            <span>Choose a contest</span>
            <select
              value={activeContest}
              onChange={(event) => {
                setSelectedContest(event.target.value);
                setSearchQuery("");
              }}
            >
              {contests.map((contest) => (
                <option key={contest.key} value={contest.key}>
                  {contest.name} · {formatDate(contest.date)}
                </option>
              ))}
            </select>
          </label>
          {contests.find((contest) => contest.key === activeContest) && (
            <span className="leaderboard-date">
              <CalendarDays size={14} />
              {formatDate(contests.find((contest) => contest.key === activeContest)!.date)}
            </span>
          )}
        </div>
      ) : (
        <div className="leaderboard-year-filters" aria-label="Filter by academic year">
          {years.map((year) => (
            <button
              type="button"
              key={year}
              aria-pressed={selectedYear === year}
              className={selectedYear === year ? "active" : ""}
              onClick={() => {
                setSelectedYear(year);
                setSearchQuery("");
              }}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Podium spotlight for top 3 participants */}
      {activeRawRows.length >= 3 && !searchQuery && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            margin: "20px 0 16px",
          }}
          aria-label="Contest top performers"
        >
          {activeRawRows.slice(0, 3).map((item, idx) => {
            const colors = ["#ffd700", "#c0c0c0", "#cd7f32"];
            const titles = ["1st Place · Gold", "2nd Place · Silver", "3rd Place · Bronze"];
            return (
              <div
                key={item.name}
                style={{
                  border: `1px solid ${idx === 0 ? "rgba(255, 215, 0, 0.45)" : "rgba(103, 217, 238, 0.22)"}`,
                  background:
                    idx === 0
                      ? "linear-gradient(145deg, rgba(255, 215, 0, 0.08), rgba(13, 23, 39, 0.8))"
                      : "linear-gradient(145deg, rgba(23, 39, 62, 0.5), rgba(11, 20, 34, 0.8))",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="micro mono"
                    style={{ color: colors[idx], letterSpacing: "0.08em", fontWeight: 700 }}
                  >
                    {titles[idx]}
                  </span>
                  <Award size={16} style={{ color: colors[idx] }} />
                </div>
                <strong style={{ fontSize: 16, color: "#eaf5ff" }}>{item.name}</strong>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <span className="tag" style={{ fontSize: 10, padding: "2px 8px" }}>
                    {item.year}
                  </span>
                  <span
                    className="mono"
                    style={{ color: "var(--cyan)", fontWeight: 700, fontSize: 13 }}
                  >
                    {item.points.toLocaleString("en-IN")} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and Export Bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "18px 0 12px",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8996aa",
            }}
          />
          <input
            aria-label="Search student by name"
            placeholder="Search student name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              background: "rgba(16, 29, 48, 0.7)",
              border: "1px solid rgba(40, 67, 93, 0.6)",
              borderRadius: 8,
              color: "#eaf5ff",
              fontSize: 13,
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="button button-secondary"
          style={{ padding: "8px 14px", fontSize: 12, display: "inline-flex", gap: 6 }}
        >
          <Download size={13} /> Export Standings (CSV)
        </button>
      </div>

      <StandingsTable
        rows={filteredRows}
        showYear={view === "contest"}
        empty={
          searchQuery
            ? `No students matching "${searchQuery}".`
            : view === "contest"
              ? "No published results for this contest yet."
              : `No published points for ${selectedYear} yet.`
        }
      />

      <p className="leaderboard-footnote">
        Rankings show results that organizers have chosen to publish. Tied point totals share the
        same rank.
      </p>
    </div>
  );
}

function StandingsTable({
  rows,
  empty,
  showYear = true,
}: {
  rows: { name: string; year: LeaderboardEntry["academic_year"]; points: number; detail: string }[];
  empty: string;
  showYear?: boolean;
}) {
  if (!rows.length) return <div className="leaderboard-empty compact">{empty}</div>;
  const ranked = rows.reduce<
    {
      name: string;
      year: LeaderboardEntry["academic_year"];
      points: number;
      detail: string;
      rank: number;
    }[]
  >((acc, row) => {
    const prev = acc[acc.length - 1];
    const rank = prev && row.points === prev.points ? prev.rank : acc.length + 1;
    acc.push({ ...row, rank });
    return acc;
  }, []);

  return (
    <div className="leaderboard-table-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Student</th>
            {showYear && <th scope="col">Year</th>}
            <th scope="col">Scope</th>
            <th scope="col" className="leaderboard-points-heading">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((row, index) => (
            <tr key={`${row.name}-${row.year}-${row.points}-${index}`}>
              <td>
                <span className={`leaderboard-rank ${row.rank <= 3 ? "top" : ""}`}>
                  {row.rank <= 3 && <Award size={14} aria-hidden="true" />}#{row.rank}
                </span>
              </td>
              <td>
                <strong>{row.name}</strong>
              </td>
              {showYear && (
                <td>
                  <span className="tag">{row.year}</span>
                </td>
              )}
              <td>{row.detail || "This contest"}</td>
              <td className="leaderboard-points">{row.points.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
