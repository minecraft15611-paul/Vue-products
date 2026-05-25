import { defineStore } from 'pinia';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { sendOtp, verifyOtp, saveName, loginWithGoogleBackend, fetchMe, logout } from '../service/auth';

interface AuthUser {
    email: string;
    name: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as AuthUser | null,
        loading: false,
        signingOut: false,
        authReady: false, // true once initAuth resolves
    }),

    getters: {
        isLoggedIn: (state) => !!state.user,
    },

    actions: {
        // Called once in App.vue on mount — rehydrates session from httpOnly cookie
        async initAuth() {
            try {
                const me = await fetchMe();
                this.user = me ?? null;
            } catch {
                this.user = null;
            } finally {
                this.authReady = true;
            }
        },

        // Step 1 of email OTP flow — sends code to inbox
        async sendOtp(email: string) {
            this.loading = true;
            try {
                await sendOtp(email);
            } finally {
                this.loading = false;
            }
        },

        // Step 2 — verifies code; returns { needsName, email }
        async verifyOtp(email: string, code: string) {
            this.loading = true;
            try {
                const result = await verifyOtp(email, code);
                if (!result.needsName) {
                    // Returning user — session cookie already set by backend
                    this.user = { email: result.email, name: result.name };
                }
                return result;
            } finally {
                this.loading = false;
            }
        },

        // Step 3 (first-time OTP users only) — saves name, backend sets cookie
        async saveName(email: string, name: string) {
            this.loading = true;
            try {
                const result = await saveName(email, name);
                this.user = { email: result.email, name: result.name };
            } finally {
                this.loading = false;
            }
        },

        // Google OAuth — Firebase handles popup, we send email+name to our backend
        async loginWithGoogle() {
            this.loading = true;
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const { email, displayName } = result.user;

                if (!email) throw new Error('No email from Google');

                const data = await loginWithGoogleBackend(email, displayName ?? '');
                this.user = { email: data.email, name: data.name };

                // Sign out from Firebase immediately — we use our own session cookie
                await firebaseSignOut(auth);

                return this.user;
            } catch (error: any) {
                if (error.code === 'auth/popup-closed-by-user') return null;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Logout — clears cookie on backend, clears state
        async signOut(router: ReturnType<typeof import('vue-router').useRouter>) {
            this.signingOut = true;
            try {
                await logout();
                this.user = null;
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push('/LoginView');
            } catch (error) {
                console.error('Sign out error:', error);
            } finally {
                this.signingOut = false;
            }
        },
    },
});