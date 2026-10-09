import { z } from "zod";

const webUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), "Use an http or https URL.");
const optionalUrl = z.union([z.literal(""), webUrl]).optional();
export const joinSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  academic_year: z.enum(["Year 1", "Year 2", "Year 3", "Year 4", "Other"]),
  interests: z
    .array(z.string().trim().min(1).max(80))
    .min(1, "Choose at least one interest.")
    .max(7),
  experience_level: z.enum(["Just starting", "Some practice", "Building projects", "Experienced"]),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  why_join: z.string().trim().min(20, "Tell us a little more (at least 20 characters). ").max(1200),
  consent: z
    .boolean()
    .refine((value) => value, "Please agree to the privacy notice before submitting."),
  website: z.string().max(0).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  subject: z.string().trim().min(3, "Add a subject.").max(150),
  message: z.string().trim().min(15, "Add a little more detail.").max(4000),
  website: z.string().max(0).optional(),
});

export const eventRegistrationSchema = z.object({
  event_id: z.string().uuid("This event is not ready for registration."),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  website: z.string().max(0).optional(),
});

export type JoinFormValues = z.infer<typeof joinSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
