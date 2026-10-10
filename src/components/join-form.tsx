"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinSchema, type JoinFormValues } from "@/lib/schemas";
import { apiUrl } from "@/lib/api-url";

const interestOptions = [
  "Competitive programming & DSA",
  "Web development",
  "AI & machine learning",
  "Open source",
  "App development",
  "Systems & developer tools",
  "Hackathons & product building",
];

export function JoinForm({ initialInterest }: { initialInterest?: string }) {
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      interests: initialInterest ? [initialInterest] : [],
      consent: false,
      academic_year: "Year 1",
      experience_level: "Just starting",
    },
  });
  const submit = async (values: JoinFormValues) => {
    setNotice(null);
    try {
      const response = await fetch(apiUrl("/api/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your application could not be saved.");
      setNotice({
        kind: "success",
        text: "Thanks for reaching out. Your interest form is saved; the club team can follow up using your email.",
      });
      reset();
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Your application could not be saved.",
      });
    }
  };
  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      {notice && (
        <div
          className={`form-status ${notice.kind}`}
          role={notice.kind === "error" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="full_name">Full name *</label>
          <input id="full_name" autoComplete="name" {...register("full_name")} />
          {errors.full_name && <span className="field-error">{errors.full_name.message}</span>}
        </div>
        <div className="field">
          <label htmlFor="email">College email *</label>
          <input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
          <span className="field-hint">
            Any valid email is fine; no domain restriction is assumed.
          </span>
        </div>
        <div className="field">
          <label htmlFor="academic_year">Academic year *</label>
          <select id="academic_year" {...register("academic_year")}>
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
            <option>Year 4</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="experience_level">Experience *</label>
          <select id="experience_level" {...register("experience_level")}>
            <option>Just starting</option>
            <option>Some practice</option>
            <option>Building projects</option>
            <option>Experienced</option>
          </select>
        </div>
        <fieldset className="field full interest-field">
          <legend>What are you interested in? *</legend>
          <div className="interest-options">
            {interestOptions.map((interest) => (
              <label className="check-line" key={interest}>
                <input type="checkbox" value={interest} {...register("interests")} />
                <span>{interest}</span>
              </label>
            ))}
          </div>
          {errors.interests && <span className="field-error">{errors.interests.message}</span>}
        </fieldset>
        <div className="field">
          <label htmlFor="github_url">GitHub profile (optional)</label>
          <input
            id="github_url"
            type="url"
            placeholder="https://github.com/you"
            {...register("github_url")}
          />
          {errors.github_url && (
            <span className="field-error">Enter a full URL, or leave blank.</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="linkedin_url">LinkedIn profile (optional)</label>
          <input
            id="linkedin_url"
            type="url"
            placeholder="https://linkedin.com/in/you"
            {...register("linkedin_url")}
          />
          {errors.linkedin_url && (
            <span className="field-error">Enter a full URL, or leave blank.</span>
          )}
        </div>
        <div className="field full">
          <label htmlFor="why_join">What would you like to learn or make? *</label>
          <textarea id="why_join" rows={4} {...register("why_join")} />
          {errors.why_join && <span className="field-error">{errors.why_join.message}</span>}
        </div>
        <div className="trap" aria-hidden="true">
          <label htmlFor="website">Leave this blank</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
        <div className="field full">
          <label className="check-line">
            <input type="checkbox" {...register("consent")} />
            <span>
              I agree to the{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}
              >
                privacy notice
              </a>
              . The club may use these details to review my interest and follow up. *
            </span>
          </label>
          {errors.consent && <span className="field-error">{errors.consent.message}</span>}
        </div>
      </div>
      <button className="button form-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send your interest form"}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
