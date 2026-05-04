import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Enter the correct 8-digit code')
});

export type LoginForm = z.infer<typeof loginSchema>;

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
    };
}