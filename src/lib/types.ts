import z from "zod";

export const registerSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim(),
  password: z.string(),
});
