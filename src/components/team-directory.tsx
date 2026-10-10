"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Github, Instagram, Linkedin } from "lucide-react";
import type { TeamMember } from "@/lib/types";

function TeamMemberCard({ member }: { member: TeamMember }) {
  const [isOpen, setIsOpen] = useState(false);
  const detailsId = `team-profile-${member.id}`;
  const skills = member.skills ?? [];

  return (
    <article className={`team-card${isOpen ? " is-expanded" : ""}`}>
      <div className="team-card-profile">
        <div className="team-avatar-frame">
          {member.image_url ? (
            <Image
              src={member.image_url}
              alt={`${member.name} profile`}
              width={112}
              height={112}
              unoptimized
              className="team-avatar"
            />
          ) : (
            <span className="team-avatar-fallback" aria-hidden="true">
              {member.name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className="team-card-identity">
          <h3>{member.name}</h3>
          <p className="team-role">{member.role}</p>
        </div>
      </div>

      {(member.github_url || member.linkedin_url || member.instagram_url) && (
        <div className="team-socials">
          {member.github_url && (
            <a
              className="team-social-link"
              href={member.github_url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on GitHub`}
              title="GitHub"
            >
              <Github size={17} />
            </a>
          )}
          {member.linkedin_url && (
            <a
              className="team-social-link"
              href={member.linkedin_url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              title="LinkedIn"
            >
              <Linkedin size={17} />
            </a>
          )}
          {member.instagram_url && (
            <a
              className="team-social-link"
              href={member.instagram_url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on Instagram`}
              title="Instagram"
            >
              <Instagram size={17} />
            </a>
          )}
        </div>
      )}

      <button
        className="team-view-profile"
        type="button"
        aria-expanded={isOpen}
        aria-controls={detailsId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>$</span>
        <span>{isOpen ? `./close-profile ${member.slug}` : `./view-profile ${member.slug}`}</span>
        <ChevronDown
          size={15}
          className={isOpen ? "team-profile-chevron is-open" : "team-profile-chevron"}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="team-inline-profile" id={detailsId}>
          <div className="eyebrow mono">About</div>
          <p className="team-inline-bio">
            {member.bio || "This team member’s introduction will be added soon."}
          </p>

          {skills.length > 0 && (
            <div className="team-inline-section">
              <div className="eyebrow mono">Skills &amp; tools</div>
              <div className="team-inline-tags">
                {skills.map((skill) => (
                  <span className="tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {member.interests.length > 0 && (
            <div className="team-inline-section">
              <div className="eyebrow mono">Areas of interest</div>
              <div className="team-inline-tags">
                {member.interests.map((interest) => (
                  <span className="tag" key={interest}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function TeamDirectory({ members }: { members: TeamMember[] }) {
  return (
    <div className="team-grid">
      {members.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}
