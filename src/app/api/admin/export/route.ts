import { NextRequest, NextResponse } from "next/server";
import { getAdminState } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase";

function csv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
export async function GET(request: NextRequest) {
  if ((await getAdminState()).status !== "authorized")
    return NextResponse.json(
      { error: "Administrator authentication is required." },
      { status: 401 },
    );
  const type = request.nextUrl.searchParams.get("type");
  const client = createAdminClient();
  const table =
    type === "applications"
      ? "membership_applications"
      : type === "registrations"
        ? "event_registrations"
        : null;
  if (!table) return NextResponse.json({ error: "Unsupported export." }, { status: 400 });
  const { data, error } = await client
    .from(table)
    .select(
      type === "applications"
        ? "id,full_name,email,academic_year,interests,experience_level,github_url,linkedin_url,why_join,status,created_at"
        : "id,event_id,name,email,status,created_at",
    )
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: `Export failed: ${error.message}` }, { status: 500 });
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const keys = rows.length
    ? Object.keys(rows[0])
    : type === "applications"
      ? [
          "id",
          "full_name",
          "email",
          "academic_year",
          "interests",
          "experience_level",
          "github_url",
          "linkedin_url",
          "why_join",
          "status",
          "created_at",
        ]
      : ["id", "event_id", "name", "email", "status", "created_at"];
  const output = [
    keys.map(csv).join(","),
    ...rows.map((row) => keys.map((key) => csv(row[key])).join(",")),
  ].join("\r\n");
  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vulcan-${type}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
