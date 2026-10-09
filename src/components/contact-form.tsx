"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/schemas";

export function ContactForm() {
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });
  const submit = async (values: ContactFormValues) => {
    setNotice(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your message could not be saved.");
      setNotice({ kind: "success", text: "Your message is saved. Thank you for reaching out." });
      reset();
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Your message could not be saved.",
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
          <label htmlFor="contact-name">Name *</label>
          <input id="contact-name" autoComplete="name" {...register("name")} />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email *</label>
          <input id="contact-email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>
        <div className="field full">
          <label htmlFor="contact-subject">Subject *</label>
          <input id="contact-subject" {...register("subject")} />
          {errors.subject && <span className="field-error">{errors.subject.message}</span>}
        </div>
        <div className="field full">
          <label htmlFor="contact-message">Message *</label>
          <textarea id="contact-message" rows={7} {...register("message")} />
          {errors.message && <span className="field-error">{errors.message.message}</span>}
        </div>
        <div className="trap" aria-hidden="true">
          <label htmlFor="contact-website">Leave this blank</label>
          <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </div>
      <button className="button form-submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
