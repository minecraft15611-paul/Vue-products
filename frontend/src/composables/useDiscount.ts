import { ref, computed, type Ref } from 'vue';

const MOCK_COUPONS = [
    { code: 'SAVE10', type: 'percent' as const, value: 10, minSpend: 500 },
    { code: 'GIFT100', type: 'fixed' as const, value: 100, minSpend: 1000 }
];

interface Coupon {
    code: string
    type: 'percent' | 'fixed'
    value: number
    minSpend: number
}

export function useDiscount(subtotal: Ref<number>) {
    const appliedCoupon = ref<Coupon | null>(null);
    const error = ref('');

    const discountAmount = computed(() => {
        if (!appliedCoupon.value) return 0;
        const { type, value } = appliedCoupon.value;
        return type === 'percent' ? subtotal.value * (value / 100) : value;
    });

    const applyCoupon = (code: string) => {
        error.value = '';
        const coupon = MOCK_COUPONS.find(c => c.code === code.trim().toUpperCase());

        if (!coupon) {
            error.value = 'Invalid discount code';
            appliedCoupon.value = null;
            return false;
        }

        if (subtotal.value < coupon.minSpend) {
            error.value = `Minimum spend of $${coupon.minSpend} required.`;
            appliedCoupon.value = null;
            return false;
        }

        appliedCoupon.value = coupon;
        return true;
    };

    const clearError = () => { error.value = ''; };

    return {
        appliedCoupon,
        discountAmount,
        error,
        applyCoupon,
        clearError,
    };
}