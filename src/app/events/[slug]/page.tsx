import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { EventRegistration } from "@/components/event-registration";
import { getEvent } from "@/lib/data";
import { canonicalMetadata } from "@/lib/site-meta";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return {
    title: event?.title ?? "Event details",
    description: event?.description,
    ...(event ? canonicalMetadata(`/events/${slug}`) : {}),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const date = new Date(event.starts_at);
  const preview = event.id.startsWith("demo-");
  return (
    <>
      <PageHero
        eyebrow={`Events / ${event.category}`}
        title={event.title}
        description={event.description}
      />
      <section className="section">
        <div className="shell split">
          <div>
            {preview && (
              <div className="data-note">
                <span className="tag tag-orange">Preview content</span>
                <span>
                  Fictional local example. Event registration is disabled for preview records.
                </span>
              </div>
            )}
            {event.cover_image_url && (
              <Image
                src={event.cover_image_url}
                alt="Event poster for this session"
                width={1000}
                height={560}
                unoptimized
                className="event-detail-image"
              />
            )}
            <div className="eyebrow mono">Session details</div>
            <div className="roadmap">
              <div className="roadmap-step">
                <span>
                  <CalendarDays size={16} />
                </span>
                <div>
                  <h3>
                    {date.toLocaleDateString("en", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p>
                    {date.toLocaleTimeString("en", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZoneName: "short",
                    })}
                    {event.ends_at &&
                      ` — ${new Date(event.ends_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}`}
                  </p>
                </div>
              </div>
              {event.venue && (
                <div className="roadmap-step">
                  <span>
                    <MapPin size={16} />
                  </span>
                  <div>
                    <h3>Where to join</h3>
                    <p>{event.venue}</p>
                  </div>
                </div>
              )}
              {event.registration_deadline && (
                <div className="roadmap-step">
                  <span>BY</span>
                  <div>
                    <h3>Registration deadline</h3>
                    <p>
                      {new Date(event.registration_deadline).toLocaleString("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="data-note">
              <span className="tag">{event.category}</span>
              <span>
                Details are managed by Vulcan Club organizers. Check back for updates before the
                session.
              </span>
            </div>
            <Link href="/events" className="text-link">
              <ArrowLeft size={13} /> Back to all events
            </Link>
          </div>
          <div className="admin-panel">
            {event.registration_url ? (
              <>
                <h2 style={{ fontSize: 25, marginTop: 0 }}>Registration hosted externally</h2>
                <p className="muted" style={{ fontSize: 13 }}>
                  Continue to the event organizer’s registration page.
                </p>
                <a
                  className="button"
                  href={event.registration_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open registration ↗
                </a>
              </>
            ) : preview ? (
              <>
                <h2 style={{ fontSize: 25, marginTop: 0 }}>Preview event</h2>
                <p className="muted" style={{ fontSize: 13 }}>
                  Internal registration appears for published Supabase events only.
                </p>
              </>
            ) : (
              <EventRegistration eventId={event.id} eventTitle={event.title} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
