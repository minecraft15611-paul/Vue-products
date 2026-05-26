<script setup lang="ts">
import { ref, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { emailSchema, otpSchema, nameSchema } from '../schemas/authSchema';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

type Step = 'email' | 'otp' | 'name';

const authStore = useAuthStore();
const router = useRouter();

const step = ref<Step>('email');
const pendingEmail = ref('');
const submitError = ref('');
const submitting = ref(false);
const googleLoading = ref(false);

// ── Email form ────────────────────────────────────────────────────────────────
const emailForm = useForm({ validationSchema: toTypedSchema(emailSchema) });
const [email, emailProps] = emailForm.defineField('email', {
    validateOnBlur: false, validateOnChange: false,
    validateOnInput: false, validateOnModelUpdate: false,
});
const isFocused = ref(false);
watch(email, (val) => { if (!val) { emailForm.setFieldError('email', undefined); submitError.value = ''; } });

// ── OTP form ──────────────────────────────────────────────────────────────────
const otpForm = useForm({ validationSchema: toTypedSchema(otpSchema) });
const [code, codeProps] = otpForm.defineField('code', {
    validateOnBlur: false, validateOnChange: false,
    validateOnInput: false, validateOnModelUpdate: false,
});
const isOtpFocused = ref(false);

// ── Name form ─────────────────────────────────────────────────────────────────
const nameForm = useForm({ validationSchema: toTypedSchema(nameSchema) });
const [name, nameProps] = nameForm.defineField('name', {
    validateOnBlur: false, validateOnChange: false,
    validateOnInput: false, validateOnModelUpdate: false,
});
const isNameFocused = ref(false);

// ── Handlers ──────────────────────────────────────────────────────────────────
const handleEmailSubmit = emailForm.handleSubmit(async (values) => {
    submitError.value = '';
    submitting.value = true;
    try {
        await authStore.sendOtp(values.email);
        pendingEmail.value = values.email;
        step.value = 'otp';
    } catch (e: any) {
        submitError.value = e.message || 'Failed to send code. Please try again.';
    } finally {
        submitting.value = false;
    }
});

const handleOtpSubmit = otpForm.handleSubmit(async (values) => {
    submitError.value = '';
    submitting.value = true;
    try {
        const result = await authStore.verifyOtp(pendingEmail.value, values.code);
        if (result.needsName) {
            step.value = 'name';
        } else {
            router.push('/');
        }
    } catch (e: any) {
        submitError.value = e.message || 'Invalid code. Please try again.';
    } finally {
        submitting.value = false;
    }
});

const handleNameSubmit = nameForm.handleSubmit(async (values) => {
    submitError.value = '';
    submitting.value = true;
    try {
        await authStore.saveName(pendingEmail.value, values.name);
        router.push('/');
    } catch (e: any) {
        submitError.value = e.message || 'Failed to save name. Please try again.';
    } finally {
        submitting.value = false;
    }
});

async function handleGoogleLogin() {
    googleLoading.value = true;
    submitError.value = '';
    try {
        const user = await authStore.loginWithGoogle();
        if (user) router.push('/');
    } catch {
        submitError.value = 'Google sign-in failed. Please try again.';
    } finally {
        googleLoading.value = false;
    }
}

async function resendCode() {
    submitting.value = true;
    submitError.value = '';
    try {
        await authStore.sendOtp(pendingEmail.value);
    } catch (e: any) {
        submitError.value = e.message || 'Failed to resend code.';
    } finally {
        submitting.value = false;
    }
}

function goBack() {
    step.value = 'email';
    submitError.value = '';
    otpForm.resetForm();
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

                <button
                    @click="handleGoogleLogin"
                    :disabled="googleLoading"
                    class="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 mb-3 text-[14px] font-medium text-gray-700 bg-white cursor-pointer transition hover:bg-gray-50 disabled:opacity-60"
                >
                    <svg v-if="!googleLoading" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <svg v-else class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span>{{ googleLoading ? 'Signing in...' : 'Continue with Google' }}</span>
                </button>

                <div class="flex w-full items-center mb-3">
                    <div class="flex-1 border-t border-gray-300"></div>
                    <span class="px-4 text-[14px] text-gray-500">or</span>
                    <div class="flex-1 border-t border-gray-300"></div>
                </div>

                <input
                    v-model="email" v-bind="emailProps"
                    type="email" placeholder="Email"
                    class="w-full px-4 py-3 mb-1 text-[14px] transition-all duration-150 outline-none"
                    :class="inputClass(!!emailForm.errors.value.email, isFocused)"
                    @focus="isFocused = true" @blur="isFocused = false"
                />
                <div v-if="emailForm.errors.value.email || submitError" class="w-full mb-2">
                    <p class="text-[12px] text-red-500">{{ emailForm.errors.value.email || submitError }}</p>
                </div>

                <button
                    @click="handleEmailSubmit"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light mt-2 cursor-pointer disabled:opacity-70 transition-all flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Continue with email</span>
                </button>

                <div class="text-[11px] text-gray-500 text-center leading-relaxed mt-4">
                    By continuing, you agree to our
                    <span class="cursor-pointer underline underline-offset-2 transition-colors">Terms of service</span>
                </div>
                <div class="w-full bg-yellow-50 border border-yellow-200 p-3 mb-4 rounded flex items-start gap-2">
                    <span class="text-yellow-600 text-[16px]">⚠️</span>
                    <p class="text-[12px] text-yellow-700 leading-tight">
                        <strong>System Maintenance Notice:</strong> We are currently performing maintenance on our Google Sign-In feature. In the meantime, we kindly invite you to use our <strong>Email OTP authentication</strong> to log in. We apologize for any inconvenience this may cause and appreciate your kind understanding.
                    </p>
                </div>
            </template>

            <!-- Step: otp -->
            <template v-else-if="step === 'otp'">
                <div class="text-xl font-light self-start mb-1">Check your email</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">
                    We sent a 6-digit code to {{ pendingEmail }}
                </div>

                <input
                    v-model="code" v-bind="codeProps"
                    type="text" inputmode="numeric" maxlength="6" placeholder="000000"
                    class="w-full px-4 py-3 mb-1 text-[14px] tracking-[0.3em] text-center transition-all duration-150 outline-none"
                    :class="inputClass(!!otpForm.errors.value.code, isOtpFocused)"
                    @focus="isOtpFocused = true" @blur="isOtpFocused = false"
                />
                <div v-if="otpForm.errors.value.code || submitError" class="w-full mb-2">
                    <p class="text-[12px] text-red-500">{{ otpForm.errors.value.code || submitError }}</p>
                </div>

                <button
                    @click="handleOtpSubmit"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light mt-2 cursor-pointer disabled:opacity-70 transition-all flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Verify</span>
                </button>

                <div class="flex gap-4 mt-4 text-[13px] text-gray-500">
                    <button @click="resendCode" :disabled="submitting" class="underline underline-offset-2 cursor-pointer disabled:opacity-50">Resend code</button>
                    <span>·</span>
                    <button @click="goBack" class="underline underline-offset-2 cursor-pointer">Use different email</button>
                </div>
            </template>

            <!-- Step: name (first-time users only) -->
            <template v-else-if="step === 'name'">
                <div class="text-xl font-light self-start mb-1">What's your name?</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">
                    This is how we'll address you in emails and on the site.
                </div>

                <input
                    v-model="name" v-bind="nameProps"
                    type="text" placeholder="Your name"
                    class="w-full px-4 py-3 mb-1 text-[14px] transition-all duration-150 outline-none"
                    :class="inputClass(!!nameForm.errors.value.name, isNameFocused)"
                    @focus="isNameFocused = true" @blur="isNameFocused = false"
                />
                <div v-if="nameForm.errors.value.name || submitError" class="w-full mb-2">
                    <p class="text-[12px] text-red-500">{{ nameForm.errors.value.name || submitError }}</p>
                </div>

                <button
                    @click="handleNameSubmit"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light mt-2 cursor-pointer disabled:opacity-70 transition-all flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Continue</span>
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

                <button
                    @click="handleGoogleLogin"
                    :disabled="googleLoading"
                    class="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 mb-4 text-[14px] font-medium text-gray-700 bg-white cursor-pointer transition hover:bg-gray-50 disabled:opacity-60"
                >
                    <svg v-if="!googleLoading" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <svg v-else class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span>{{ googleLoading ? 'Signing in...' : 'Continue with Google' }}</span>
                </button>

                <div class="flex w-full items-center mb-4">
                    <div class="flex-1 border-t border-gray-300"></div>
                    <span class="px-4 text-[13px] text-gray-400">or</span>
                    <div class="flex-1 border-t border-gray-300"></div>
                </div>

                <input
                    v-model="email" v-bind="emailProps"
                    type="email" placeholder="Email"
                    class="w-full px-4 py-3 mb-1 text-[14px] transition-all duration-150 outline-none"
                    :class="inputClass(!!emailForm.errors.value.email, isFocused)"
                    @focus="isFocused = true" @blur="isFocused = false"
                />
                <div v-if="emailForm.errors.value.email || submitError" class="w-full mb-3">
                    <p class="text-[12px] text-red-500">{{ emailForm.errors.value.email || submitError }}</p>
                </div>

                <button
                    @click="handleEmailSubmit"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light tracking-wide cursor-pointer transition mt-2 mb-4 disabled:opacity-70 flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Continue with email</span>
                </button>

                <div class="text-[11px] text-gray-400 text-center leading-relaxed">
                    By continuing, you agree to our
                    <span class="cursor-pointer underline underline-offset-2 hover:text-gray-600 transition-colors">Terms of service</span>
                </div>
                <div class="w-full bg-yellow-50 border border-yellow-200 p-3 mb-4 rounded flex items-start gap-2">
                    <span class="text-yellow-600 text-[16px]">⚠️</span>
                    <p class="text-[12px] text-yellow-700 leading-tight">
                        <strong>Internal Testing Notice:</strong> Google sign-in is fully functional, but our <strong>email verification</strong> system is currently restricted to authorized test accounts. If you wish to use email login, please contact the developer to add your address to the whitelist.
                    </p>
                </div>
            </template>

            <!-- Step: otp -->
            <template v-else-if="step === 'otp'">
                <div class="text-[22px] font-light mb-1">Check your email</div>
                <div class="text-[13px] text-gray-400 mb-6">
                    We sent a 6-digit code to {{ pendingEmail }}
                </div>

                <input
                    v-model="code" v-bind="codeProps"
                    type="text" inputmode="numeric" maxlength="6" placeholder="000000"
                    class="w-full px-4 py-3 mb-1 text-[18px] tracking-[0.5em] text-center transition-all duration-150 outline-none"
                    :class="inputClass(!!otpForm.errors.value.code, isOtpFocused)"
                    @focus="isOtpFocused = true" @blur="isOtpFocused = false"
                />
                <div v-if="otpForm.errors.value.code || submitError" class="w-full mb-3">
                    <p class="text-[12px] text-red-500">{{ otpForm.errors.value.code || submitError }}</p>
                </div>

                <button
                    @click="handleOtpSubmit"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light tracking-wide cursor-pointer transition mt-2 mb-4 disabled:opacity-70 flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Verify</span>
                </button>

                <div class="flex gap-4 text-[13px] text-gray-400 justify-center">
                    <button @click="resendCode" :disabled="submitting" class="underline underline-offset-2 hover:text-gray-600 cursor-pointer disabled:opacity-50 transition-colors">Resend code</button>
                    <span>·</span>
                    <button @click="goBack" class="underline underline-offset-2 hover:text-gray-600 cursor-pointer transition-colors">Use different email</button>
                </div>
            </template>

            <!-- Step: name (first-time users only) -->
            <template v-else-if="step === 'name'">
                <div class="text-[22px] font-light mb-1">What's your name?</div>
                <div class="text-[13px] text-gray-400 mb-6">
                    This is how we'll address you in emails and on the site.
                </div>

                <input
                    v-model="name" v-bind="nameProps"
                    type="text" placeholder="Your name"
                    class="w-full px-4 py-3 mb-1 text-[14px] transition-all duration-150 outline-none"
                    :class="inputClass(!!nameForm.errors.value.name, isNameFocused)"
                    @focus="isNameFocused = true" @blur="isNameFocused = false"
                />
                <div v-if="nameForm.errors.value.name || submitError" class="w-full mb-3">
                    <p class="text-[12px] text-red-500">{{ nameForm.errors.value.name || submitError }}</p>
                </div>

                <button
                    @click="handleNameSubmit"
                    :disabled="submitting"
                    class="w-full bg-black text-white py-3 font-light tracking-wide cursor-pointer transition mt-2 mb-4 disabled:opacity-70 flex items-center justify-center"
                >
                    <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span v-else>Continue</span>
                </button>
            </template>

        </div>

        <footer class="absolute bottom-6 text-[12px] text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
            Privacy policy
        </footer>
    </div>
</template>