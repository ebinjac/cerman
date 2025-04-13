import { z } from "zod";

export const teamFormSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  alert1: z.string().email("Primary alert contact must be a valid email"),
  alert2: z.string().email("Secondary alert contact must be a valid email").optional(),
  alert3: z.string().email("Tertiary alert contact must be a valid email").optional(),
  escalation: z.string().optional(),
  isActive: z.boolean(),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>; 