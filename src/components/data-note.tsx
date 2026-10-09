import { Info, TriangleAlert } from "lucide-react";
import type { DataResult } from "@/lib/types";

export function DataNote<T>({ result }: { result: DataResult<T> }) {
  if (result.source === "supabase") return null;
  const error = result.source === "error";
  return (
    <div className="data-note" role={error ? "alert" : "status"}>
      {error ? (
        <TriangleAlert size={16} color="var(--orange)" />
      ) : (
        <Info size={16} color="var(--cyan)" />
      )}
      <div>
        <strong>
          {result.source === "demo"
            ? "Preview content"
            : error
              ? "Live content unavailable"
              : "Content setup"}
        </strong>
        {result.message}
      </div>
    </div>
  );
}
