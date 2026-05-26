import { z } from 'zod';

export const emailSchema = z.object({
    email: z.string().email('Enter a valid email address'),
});

export const otpSchema = z.object({
    code: z
        .string()
        .length(6, 'Code must be 6 digits')
        .regex(/^\d+$/, 'Code must be numbers only'),
});

export const nameSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
});

export type EmailForm = z.infer<typeof emailSchema>;
export type OtpForm   = z.infer<typeof otpSchema>;
export type NameForm  = z.infer<typeof nameSchema>;