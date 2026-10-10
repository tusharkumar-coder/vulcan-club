"use client";

import { useState, type FormEvent } from "react";
import type { LeaderboardEntry } from "@/lib/types";

const academicYears: LeaderboardEntry["academic_year"][] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Other",
];

export function LeaderboardManager({
  entries,
  busy,
  onSave,
  onDelete,
  onStatus,
}: {
  entries: LeaderboardEntry[];
  busy: boolean;
  onSave: (form: FormData, id?: string) => Promise<boolean>;
  onDelete: (type: "leaderboard_entries", id: string) => void;
  onStatus: (type: "leaderboard_entries", id: string, record: Record<string, unknown>) => void;
}) {
  const [editing, setEditing] = useState<LeaderboardEntry | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await onSave(new FormData(form), editing?.id)) {
      form.reset();
      setEditing(null);
    }
  }

  return (
    <div>
      <div className="admin-panel" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 20, marginTop: 0 }}>
          {editing ? "Edit contest result" : "Add contest result"}
        </h3>
        <p className="muted" style={{ fontSize: 13 }}>
          Add one result per student per contest. Points are used to calculate the year-wise totals.
        </p>
        <form key={editing?.id ?? "new-result"} onSubmit={submit} className="admin-form-grid">
          <div className="field">
            <label htmlFor="leaderboard-student">Student name</label>
            <input
              id="leaderboard-student"
              name="student_name"
              defaultValue={editing?.student_name ?? ""}
              maxLength={120}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="leaderboard-year">Academic year</label>
            <select
              id="leaderboard-year"
              name="academic_year"
              defaultValue={editing?.academic_year ?? "1st Year"}
              required
            >
              {academicYears.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="leaderboard-contest">Contest name</label>
            <input
              id="leaderboard-contest"
              name="contest_name"
              defaultValue={editing?.contest_name ?? ""}
              maxLength={180}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="leaderboard-date">Contest date</label>
            <input
              id="leaderboard-date"
              name="contest_date"
              type="date"
              defaultValue={editing?.contest_date.slice(0, 10) ?? ""}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="leaderboard-points">Points</label>
            <input
              id="leaderboard-points"
              name="points"
              type="number"
              min="0"
              step="0.01"
              defaultValue={editing ? String(editing.points) : "0"}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="leaderboard-status">Visibility</label>
            <select id="leaderboard-status" name="status" defaultValue={editing?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="field full" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : editing ? "Update result" : "Save result"}
            </button>
            {editing && (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <h3 style={{ fontFamily: "Space Grotesk", fontSize: 19, margin: "0 0 18px" }}>
          Contest results
        </h3>
        {entries.length ? (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student / contest</th>
                  <th>Year</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      {entry.student_name}
                      <br />
                      <span className="muted">
                        {entry.contest_name} · {entry.contest_date.slice(0, 10)}
                      </span>
                    </td>
                    <td>{entry.academic_year}</td>
                    <td>{Number(entry.points).toLocaleString("en-IN")}</td>
                    <td>
                      <span className="tag">{entry.status}</span>
                    </td>
                    <td>
                      <button
                        className="admin-action"
                        disabled={busy}
                        onClick={() => setEditing(entry)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-action"
                        disabled={busy}
                        onClick={() =>
                          onStatus("leaderboard_entries", entry.id, {
                            status: entry.status === "published" ? "draft" : "published",
                          })
                        }
                      >
                        {entry.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="admin-action danger"
                        disabled={busy}
                        onClick={() => onDelete("leaderboard_entries", entry.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No contest results yet.</strong>Add a result above, then publish it when it is
            ready for the public page.
          </div>
        )}
      </div>
    </div>
  );
}
