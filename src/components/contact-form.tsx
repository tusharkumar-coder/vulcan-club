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
      <div className="contact-console-bar" aria-hidden="true">
        <div className="contact-console-dots">
          <span />
          <span />
          <span />
        </div>
        <span>message.ts</span>
        <span className="contact-console-live">
          <i /> ready
        </span>
      </div>
      {notice && (
        <div
          className={`form-status ${notice.kind}`}
          role={notice.kind === "error" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      )}
      <div className="contact-code-body">
        <div className="contact-code-line contact-code-declaration">
          <span className="contact-line-number">01</span>
          <code>
            <span className="code-keyword">const</span> userDetails{" "}
            <span className="code-punctuation">=</span>{" "}
            <span className="code-punctuation">&#123;</span>
          </code>
        </div>
        <div className="contact-code-row">
          <span className="contact-line-number">02</span>
          <label className="contact-code-key" htmlFor="contact-name">
            name<span>:</span>
            <b>*</b>
          </label>
          <div className="contact-code-value">
            <span className="code-quote">&quot;</span>
            <input
              id="contact-name"
              className="contact-code-field"
              autoComplete="name"
              placeholder="Your name"
              aria-required="true"
              {...register("name")}
            />
            <span className="code-quote">&quot;</span>
            <span className="code-punctuation">,</span>
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>
        </div>
        <div className="contact-code-row">
          <span className="contact-line-number">03</span>
          <label className="contact-code-key" htmlFor="contact-email">
            email<span>:</span>
            <b>*</b>
          </label>
          <div className="contact-code-value">
            <span className="code-quote">&quot;</span>
            <input
              id="contact-email"
              className="contact-code-field"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-required="true"
              {...register("email")}
            />
            <span className="code-quote">&quot;</span>
            <span className="code-punctuation">,</span>
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>
        </div>
        <div className="contact-code-row">
          <span className="contact-line-number">04</span>
          <label className="contact-code-key" htmlFor="contact-subject">
            subject<span>:</span>
            <b>*</b>
          </label>
          <div className="contact-code-value">
            <span className="code-quote">&quot;</span>
            <input
              id="contact-subject"
              className="contact-code-field"
              placeholder="What’s on your mind?"
              aria-required="true"
              {...register("subject")}
            />
            <span className="code-quote">&quot;</span>
            <span className="code-punctuation">,</span>
            {errors.subject && <span className="field-error">{errors.subject.message}</span>}
          </div>
        </div>
        <div className="contact-code-row contact-code-message">
          <span className="contact-line-number">05</span>
          <label className="contact-code-key" htmlFor="contact-message">
            message<span>:</span>
            <b>*</b>
          </label>
          <div className="contact-code-value">
            <span className="code-quote">&quot;</span>
            <textarea
              id="contact-message"
              className="contact-code-field"
              rows={5}
              placeholder="Write your message..."
              aria-required="true"
              {...register("message")}
            />
            <span className="contact-message-close">
              <span className="code-quote">&quot;</span>
              <span className="code-punctuation">,</span>
            </span>
            {errors.message && <span className="field-error">{errors.message.message}</span>}
          </div>
        </div>
        <div className="contact-code-line contact-code-closing">
          <span className="contact-line-number">06</span>
          <code>
            <span className="code-punctuation">&#125;</span>
            <span className="code-punctuation">;</span>
          </code>
        </div>
        <div className="trap" aria-hidden="true">
          <label htmlFor="contact-website">Leave this blank</label>
          <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </div>
      <button className="button form-submit contact-code-submit" disabled={isSubmitting}>
        <span>{isSubmitting ? "Vulcan.sendMessage(...)" : "Vulcan.sendMessage(userDetails)"}</span>
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
