import { z } from "zod";
import { BAYAN_ROLES } from "../types";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  displayName: z.string().min(2).max(100),
  role: z.enum(BAYAN_ROLES),
  schoolId: z.string().min(1).default("kcd"),
  locale: z.enum(["ar", "en"]).default("ar"),
  familyId: z.string().optional(),
  studentIds: z.array(z.string()).default([]),
});

export const updateUserSchema = createUserSchema.omit({ email: true, password: true }).partial().extend({
  status: z.enum(["active", "invited", "suspended"]).optional(),
});

export const settingsSchema = z.object({
  schoolNameAr: z.string().min(1),
  schoolNameEn: z.string().min(1),
  defaultLocale: z.enum(["ar", "en"]),
  allowParentComments: z.boolean(),
  requireCommentModeration: z.boolean(),
  maxUploadMb: z.number().min(1).max(500),
  allowedMediaTypes: z.array(z.string()).min(1),
  brand: z.object({
    primary: z.string(),
    secondary: z.string(),
    logoUrl: z.string().url().optional().or(z.literal("")),
  }),
});
