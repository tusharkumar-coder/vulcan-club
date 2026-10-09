import type { Metadata } from "next";

export function canonicalMetadata(path: string): Pick<Metadata, "alternates"> {
  return process.env.NEXT_PUBLIC_SITE_URL ? { alternates: { canonical: path } } : {};
}
