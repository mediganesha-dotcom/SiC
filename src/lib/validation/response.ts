import { z } from "zod";

export const respondSchema = z.object({
  type: z.enum(["ACCEPT", "DECLINE"]),
});

export type RespondInput = z.infer<typeof respondSchema>;
