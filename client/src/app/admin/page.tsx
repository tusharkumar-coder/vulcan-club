import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  redirect(process.env.ADMIN_SITE_URL || "http://localhost:3002");
}
