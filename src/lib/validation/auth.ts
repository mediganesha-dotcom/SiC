import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen haben"),
  name: z.string().trim().min(1, "Name ist erforderlich").max(100),
  city: z.string().trim().min(1, "Stadt ist erforderlich").max(100),
  postalCode: z.string().trim().min(1, "Postleitzahl ist erforderlich").max(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export type LoginInput = z.infer<typeof loginSchema>;
