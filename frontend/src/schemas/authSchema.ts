import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
});

export type LoginForm = z.infer<typeof loginSchema>;