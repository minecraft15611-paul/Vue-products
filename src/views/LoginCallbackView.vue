<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase/config';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useAuthStore } from '../stores/auth';

type Status = 'verifying' | 'needs-email' | 'success' | 'error';

const router = useRouter();
const authStore = useAuthStore();

const status = ref<Status>('verifying');
const errorMessage = ref('');
const manualEmail = ref('');
const manualEmailError = ref('');

onMounted(async () => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
        status.value = 'error';
        errorMessage.value = 'This link is invalid or has already been used.';
        return;
    }

    const savedEmail = localStorage.getItem('emailForSignIn');

    if (!savedEmail) {
        // Different device — ask the user to re-enter their email
        status.value = 'needs-email';
        return;
    }

    await completeSignIn(savedEmail);
});

async function completeSignIn(email: string) {
    status.value = 'verifying';
    try {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem('emailForSignIn');
        authStore.setUser(result.user);
        status.value = 'success';
        setTimeout(() => router.push('/'), 1500);
    } catch (error: any) {
        status.value = 'error';
        errorMessage.value =
            error.code === 'auth/invalid-action-code'
                ? 'This link has expired or already been used. Please request a new one.'
                : 'Something went wrong. Please try signing in again.';
    }
}

function submitManualEmail() {
    manualEmailError.value = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!manualEmail.value || !emailRegex.test(manualEmail.value)) {
        manualEmailError.value = 'Enter a valid email address';
        return;
    }
    completeSignIn(manualEmail.value);
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

            <!-- Verifying -->
            <template v-if="status === 'verifying'">
                <div class="text-xl font-light self-start mb-1">Signing you in</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">Just a moment...</div>
                <div class="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mt-4"></div>
            </template>

            <!-- Needs email (different device) -->
            <template v-else-if="status === 'needs-email'">
                <div class="text-xl font-light self-start mb-1">Confirm your email</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">
                    It looks like you opened this link on a different device. Please enter your email to continue.
                </div>
                <input
                    v-model="manualEmail"
                    type="email"
                    placeholder="Email"
                    class="w-full border border-gray-300 px-4 py-3 mb-1 text-[14px] outline-none focus:border-gray-500 transition"
                />
                <div class="w-full min-h-[20px] mb-3">
                    <p v-if="manualEmailError" class="text-[12px] text-red-500">{{ manualEmailError }}</p>
                </div>
                <button
                    @click="submitManualEmail"
                    class="w-full bg-black text-white py-3 font-light tracking-wide transition"
                >
                    Continue
                </button>
            </template>

            <!-- Success -->
            <template v-else-if="status === 'success'">
                <div class="text-xl font-light self-start mb-1">You're signed in</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">Redirecting you now...</div>
            </template>

            <!-- Error -->
            <template v-else-if="status === 'error'">
                <div class="text-xl font-light self-start mb-1">Something went wrong</div>
                <div class="text-[13px] text-gray-400 self-start mb-6">{{ errorMessage }}</div>
                <router-link
                    to="/login"
                    class="w-full bg-black text-white py-3 font-light tracking-wide transition text-center"
                >
                    Back to sign in
                </router-link>
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

            <!-- Verifying -->
            <template v-if="status === 'verifying'">
                <div class="text-[22px] font-light mb-1">Signing you in</div>
                <div class="text-[13px] text-gray-400 mb-6">Just a moment...</div>
                <div class="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mt-2"></div>
            </template>

            <!-- Needs email (different device) -->
            <template v-else-if="status === 'needs-email'">
                <div class="text-[22px] font-light mb-1">Confirm your email</div>
                <div class="text-[13px] text-gray-400 mb-6">
                    It looks like you opened this link on a different device. Please enter your email to continue.
                </div>
                <input
                    v-model="manualEmail"
                    type="email"
                    placeholder="Email"
                    class="w-full border border-gray-300 px-4 py-3 mb-1 text-[14px] outline-none focus:border-gray-500 transition"
                />
                <div class="w-full min-h-[20px] mb-3">
                    <p v-if="manualEmailError" class="text-[12px] text-red-500">{{ manualEmailError }}</p>
                </div>
                <button
                    @click="submitManualEmail"
                    class="w-full bg-black text-white py-3 font-light tracking-wide transition"
                >
                    Continue
                </button>
            </template>

            <!-- Success -->
            <template v-else-if="status === 'success'">
                <div class="text-[22px] font-light mb-1">You're signed in</div>
                <div class="text-[13px] text-gray-400 mb-6">Redirecting you now...</div>
            </template>

            <!-- Error -->
            <template v-else-if="status === 'error'">
                <div class="text-[22px] font-light mb-1">Something went wrong</div>
                <div class="text-[13px] text-gray-400 mb-6">{{ errorMessage }}</div>
                <router-link
                    to="/login"
                    class="w-full bg-black text-white py-3 font-light tracking-wide transition text-center"
                >
                    Back to sign in
                </router-link>
            </template>

        </div>

        <footer class="absolute bottom-6 text-[12px] text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
            Privacy policy
        </footer>
    </div>
</template>