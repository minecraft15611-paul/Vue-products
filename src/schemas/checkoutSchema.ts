import { z } from "zod";

const addressSchema = z.object({
    country: z.string().min(1, 'Select a country'),
    firstName: z.string().min(1, 'Enter your first name'),
    lastName: z.string().min(1, 'Enter your last name'),
    address: z.string().min(1, 'Enter an address'),
    apartment: z.string().optional(),
    city: z.string().min(1, 'Enter a city'),
    state: z.string().min(1, 'Enter a state name'),
    postcode: z.string().min(1, 'Enter a ZIP / postcode'),
    phone: z.string()
            .refine(
        val => {
            const cleaned = val.replace(/[\s\-().]/g, '');
            const normalized = cleaned.startsWith('+') ? cleaned : '+' + cleaned;
            return /^\+[1-9]\d{6,14}$/.test(normalized);
        },
        'Enter a valid phone number with country code (e.g. +1 234 567 8900)'
  )
});

const creditCardSchema = z.object({
    cardNumber: z.string().regex(/^\d{16}$/, 'Enter a valid card number'),
    expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Enter a valid expiration date'),
    securityCode: z.string().regex(/^\d{3,4}$/, 'Enter the CVV or security code on your card'),
    nameOnCard: z.string().min(1, 'Enter the name on your card'),
});

export const checkoutSchema = z.object({
    email: z.string().email('Enter an email'),

    shipping: addressSchema,

    discountCode: z.string()
        .max(20, 'Discount code is too long')
        .optional()
        .or(z.literal('')), 

    textMeChecked: z.boolean(),
    textMePhone: z.string().optional().or(z.literal('')),
    saveInfoPhone: z.string().optional().or(z.literal('')),

    payment: z.object({
        method: z.enum(['credit', 'Klarna', 'PayPal']),
        cardNumber: z.string().optional(),
        expirationDate: z.string().optional(),
        securityCode: z.string().optional(),
        nameOnCard: z.string().optional(),
    }),

    useShippingAsBilling: z.boolean(),
    billingOptions: z.enum(['same', 'different']),

    billingSameFlow: addressSchema.optional(),
    billingDifferent: addressSchema.optional(),
})

.superRefine((data, ctx) => {
    // Credit card fields
    if (data.payment.method === 'credit') {
        const cardResult = creditCardSchema.safeParse(data.payment);
        if (!cardResult.success) {
            cardResult.error.issues.forEach(issue =>
                ctx.addIssue({ ...issue, path: ['payment', ...issue.path] })
            );
        }
    }

    // Flow 1: credit card with a separate billing address
    if (data.payment.method === 'credit' && data.useShippingAsBilling === false) {
        const result = addressSchema.safeParse(data.billingSameFlow);
        if (!result.success) {
            result.error.issues.forEach(issue =>
                ctx.addIssue({ ...issue, path: ['billingSameFlow', ...issue.path] })
            );
        }
    }

    if (data.payment.method !== 'credit' && data.billingOptions === 'different') {
        const result = addressSchema.safeParse(data.billingDifferent);
        if (!result.success) {
            result.error.issues.forEach(issue =>
                ctx.addIssue({ ...issue, path: ['billingDifferent', ...issue.path] })
            );
        }
    }

    if (data.textMeChecked === true) {
    const phoneValid = /^\+[1-9]\d{6,14}$/.test(
        data.textMePhone?.replace(/[\s\-().]/g, '') ?? ''
    );
    if (!phoneValid) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid phone number with country code (e.g. +1 234 567 8900)',
            path: ['textMePhone'],
        });
    }
}

}); 

export type checkoutSchema = z.infer<typeof checkoutSchema>;