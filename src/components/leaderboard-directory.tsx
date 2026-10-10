"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Award, CalendarDays, Trophy } from "lucide-react";
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
          onClick={() => setView("contest")}
        >
          <Trophy size={15} /> Contest-wise
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "year"}
          className={view === "year" ? "active" : ""}
          onClick={() => setView("year")}
        >
          <ArrowDownUp size={15} /> Year-wise
        </button>
      </div>

      {view === "contest" ? (
        <>
          <div className="leaderboard-filter-row">
            <label className="field">
              <span>Choose a contest</span>
              <select
                value={activeContest}
                onChange={(event) => setSelectedContest(event.target.value)}
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
          <StandingsTable
            rows={contestRows.map((entry) => ({
              name: entry.student_name,
              year: entry.academic_year,
              points: Number(entry.points),
              detail: "",
            }))}
            empty="No published results for this contest yet."
          />
        </>
      ) : (
        <>
          <div className="leaderboard-year-filters" aria-label="Filter by academic year">
            {years.map((year) => (
              <button
                type="button"
                key={year}
                aria-pressed={selectedYear === year}
                className={selectedYear === year ? "active" : ""}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
          <StandingsTable
            rows={yearRows.map((row) => ({
              name: row.name,
              year: row.year,
              points: row.points,
              detail: `${row.contests.size} ${row.contests.size === 1 ? "contest" : "contests"}`,
            }))}
            showYear={false}
            empty={`No published points for ${selectedYear} yet.`}
          />
        </>
      )}
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
  let previousPoints: number | undefined;
  let rank = 0;
  const ranked = rows.map((row, index) => {
    if (row.points !== previousPoints) rank = index + 1;
    previousPoints = row.points;
    return { ...row, rank };
  });
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
          {ranked.map((row) => (
            <tr key={`${row.name}-${row.year}`}>
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
