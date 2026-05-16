import { ref, computed, type Ref } from 'vue';

const MOCK_COUPONS = [
    { code: 'SAVE10', type: 'percent', value: 10, minSpend: 500 },
    { code: 'GIFT100', type: 'fixed', value: 100, minSpend: 1000 }
];

export function useDiscount(subtotal: Ref<number>) {
    const appliedCoupon = ref<any>(null);
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