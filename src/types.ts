import { z } from "zod";

export const Question = z.object({
  message: z.string(),
});

export const Answer = z.object({
  message: z.string(),
});
