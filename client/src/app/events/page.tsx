import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site-meta";
import { PageHero } from "@/components/page-hero";
import { DataNote } from "@/components/data-note";
import { EventDirectory } from "@/components/event-directory";
import { getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore upcoming Vulcan Club workshops, contests, build sessions, and study groups.",
  ...canonicalMetadata("/events"),
};

export default async function EventsPage() {
  const result = await getEvents();
  return (
    <>
      <PageHero
        eyebrow="Gather / Events"
        title="Make time to build together."
        description="Workshops, contests, tech talks, and study groups. Find a session that fits what you want to learn next."
      />
      <section className="section">
        <div className="shell">
          <DataNote result={result} />
          <EventDirectory records={result.records} />
        </div>
      </section>
    </>
  );
}
