import { z } from "zod";

export const examDetailsSchema = z.object({
  title: z.string().trim().min(3, "Exam name must be at least 3 characters").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  duration_minutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute").max(600),
  passing_percentage: z.coerce.number().min(0).max(100),
  instructions: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const questionSchema = z
  .object({
    question_type: z.enum([
      "multiple_choice",
      "multiple_select",
      "true_false",
      "short_answer",
      "long_answer",
    ]),
    prompt: z.string().trim().min(3, "Enter the question").max(4000),
    options: z.array(z.string().trim().max(500)).default([]),
    correct_options: z.array(z.number().int().min(0)).default([]),
    expected_answer: z.string().trim().max(2000).optional().or(z.literal("")),
    marks: z.coerce.number().min(0).max(1000),
  })
  .superRefine((value, ctx) => {
    const optionTypes = ["multiple_choice", "multiple_select", "true_false"];
    if (optionTypes.includes(value.question_type)) {
      const filled = value.options.filter((option) => option.trim().length > 0);
      if (filled.length < 2) {
        ctx.addIssue({ code: "custom", message: "Add at least two options", path: ["options"] });
      }
      if (value.correct_options.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Select the correct answer",
          path: ["correct_options"],
        });
      }
      if (value.question_type !== "multiple_select" && value.correct_options.length > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Select only one correct answer",
          path: ["correct_options"],
        });
      }
    }
  });

export const candidateAccessSchema = z.object({
  username: z
    .string()
    .trim()
    .min(4, "Username must be at least 4 characters")
    .max(60)
    .regex(/^[a-zA-Z0-9._-]+$/, "Use letters, numbers, dot, underscore or dash"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(200).optional().or(z.literal("")),
});

export const candidateLoginSchema = z.object({
  token: z.string().trim().min(6).max(120),
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(100),
});

export const globalLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(60),
  password: z.string().min(1, "Enter your password").max(100),
});
