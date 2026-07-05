import { z } from "zod";

export const updateLogisticsSchema = z.object({
  action: z.literal("updateLogistics"),
  pickupTime: z.string().min(1, "Abholzeit ist erforderlich"),
  pickupLocation: z.string().trim().min(1, "Abholort ist erforderlich").max(200),
  returnTime: z.string().min(1, "Rückgabezeit ist erforderlich"),
  returnLocation: z.string().trim().min(1, "Rückgabeort ist erforderlich").max(200),
});

export const cancelSchema = z.object({
  action: z.literal("cancel"),
});

export const patchRequestSchema = z.discriminatedUnion("action", [
  updateLogisticsSchema,
  cancelSchema,
]);
