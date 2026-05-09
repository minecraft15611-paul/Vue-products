<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { loginSchema } from '../schemas/authSchema';
import { useAuthStore } from '../stores/auth';

type Step = 'email' | 'sent';

const authStore = useAuthStore();
const step = ref<Step>('email');
const submittedEmail = ref('');
const submitError = ref('');
const submitting = ref(false);
const isFocused = ref(false);

const { handleSubmit, errors, defineField, setFieldError } = useForm({
    validationSchema: toTypedSchema(loginSchema),
});

const [email, emailProps] = defineField('email', {
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
});

watch(email, (val) => {
    if (!val) {
        setFieldError('email', undefined);
        submitError.value = '';
    }
});

const onSubmit = handleSubmit(async (values) => {
    submitError.value = '';
    try {
        await authStore.login(values);
        submittedEmail.value = values.email;
        step.value = 'sent';
    } catch {
        submitError.value = 'Failed to send link. Please try again.';
    } finally {
        submitting.value = false;
    }
});

async function handleClick() {
    submitting.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    await onSubmit();
    submitting.value = false;
}

function goBack() {
    step.value = 'email';
    submittedEmail.value = '';
    submitError.value = '';
}

function inputClass(hasError: boolean, focused: boolean): string {
    if (hasError) return 'border-red-500 border-2';
    if (focused) return 'border-black border-2';
    return 'border-gray-300 border';
}
</script>

<template>
    <!-- =============== Mobile =============== -->
    <div class="flex flex-col h-screen lg:hidden">
        <div class="w-full h-[15%] bg-white"></div>

        <div class="flex flex-col items-center h-[65%] px-5">

            <router-link to="/">
                <div class="text-[28px] tracking-[0.2em] mb-10">LemonTree</div>
            </router-link>

            <!-- Step: email -->
            <template v-if="step === 'email'">
                <div class="text-xl font-light self-start mb-1">Sign in</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">Sign in or create an account</div>

                <button class="w-full bg-[#5c47f5] text-white py-3 mb-3 font-bold cursor-pointer transition">
                    Continue with shop
                </button>

                <div class="flex w-full items-center mb-3">
                    <div class="flex-1 border-t border-gray-300"></div>
                    <span class="px-4 text-[14px] text-gray-500">or</span>
                    <div class="flex-1 border-t border-gray-300"></div>
                </div>

                <input
                    v-model="email"
                    v-bind="emailProps"
                    type="email"
                    placeholder="Email"
                    class="w-full px-4 py-3 mb-1 text-[14px] transition-all duration-150 outline-none"
                    :class="inputClass(!!errors.email, isFocused)"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                />

                <div v-if="errors.email || submitError" class="w-full mb-2">
                    <p class="text-[12px] text-red-500">{{ errors.email || submitError }}</p>
                </div>

                <button
                    @click="handleClick"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light mt-2 cursor-pointer disabled:opacity-70 transition-all flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Continue</span>
                </button>

                <div class="text-[11px] text-gray-500 text-center leading-relaxed mt-4">
                    By continuing, you agree to our
                    <span class="cursor-pointer underline underline-offset-2 transition-colors">Terms of service</span>
                </div>
            </template>

            <!-- Step: sent -->
            <template v-else-if="step === 'sent'">
                <div class="text-xl font-light self-start mb-1">Check your email</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">
                    We sent a sign-in link to {{ submittedEmail }}
                </div>

                <button
                    @click="handleClick"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light cursor-pointer disabled:opacity-50 transition flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Resend link</span>
                </button>

                <button @click="goBack" class="text-[13px] text-gray-500 underline underline-offset-2 mt-4 cursor-pointer">
                    Sign in with a different email
                </button>
            </template>

        </div>

        <div class="w-full h-[15%]"></div>
        <footer class="flex justify-center">
            <p class="text-[12px] text-gray-500">Privacy policy</p>
        </footer>
    </div>

    <!-- =============== Desktop =============== -->
    <div class="hidden lg:flex flex-col items-center pt-35 min-h-screen bg-white relative">

        <router-link to="/">
            <div class="px-10 mb-10 tracking-[0.3em] text-[26px]">LemonTree</div>
        </router-link>

        <div class="w-full max-w-[380px] flex flex-col">

            <!-- Step: email -->
            <template v-if="step === 'email'">
                <div class="text-[22px] font-light mb-1">Sign in</div>
                <div class="text-[13px] text-gray-400 mb-6">Sign in or create an account</div>

                <button class="w-full bg-[#5c47f5] text-white py-3 mb-4 font-medium tracking-wide cursor-pointer transition hover:bg-[#4a38e0]">
                    Continue with shop
                </button>

                <div class="flex w-full items-center mb-4">
                    <div class="flex-1 border-t border-gray-300"></div>
                    <span class="px-4 text-[13px] text-gray-400">or</span>
                    <div class="flex-1 border-t border-gray-300"></div>
                </div>

                <input
                    v-model="email"
                    v-bind="emailProps"
                    type="email"
                    placeholder="Email"
                    class="w-full px-4 py-3 mb-1 text-[14px] transition-all duration-150 outline-none"
                    :class="inputClass(!!errors.email, isFocused)"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                />

                <div v-if="errors.email || submitError" class="w-full mb-3">
                    <p class="text-[12px] text-red-500">{{ errors.email || submitError }}</p>
                </div>

                <button
                    @click="handleClick"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light tracking-wide cursor-pointer transition mt-2 mb-4 disabled:opacity-70 flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Continue</span>
                </button>

                <div class="text-[11px] text-gray-400 text-center leading-relaxed">
                    By continuing, you agree to our
                    <span class="cursor-pointer underline underline-offset-2 hover:text-gray-600 transition-colors">Terms of service</span>
                </div>
            </template>

            <!-- Step: sent -->
            <template v-else-if="step === 'sent'">
                <div class="text-[22px] font-light mb-1">Check your email</div>
                <div class="text-[13px] text-gray-400 mb-6">
                    We sent a sign-in link to {{ submittedEmail }}
                </div>

                <button
                    @click="handleClick"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light tracking-wide cursor-pointer transition mb-4 disabled:opacity-50 flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Resend link</span>
                </button>

                <button @click="goBack" class="text-[13px] text-gray-400 underline underline-offset-2 hover:text-gray-600 cursor-pointer transition-colors text-center">
                    Sign in with a different email
                </button>
            </template>

        </div>

        <footer class="absolute bottom-6 text-[12px] text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
            Privacy policy
        </footer>
    </div>
</template>