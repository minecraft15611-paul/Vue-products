import { defineStore } from 'pinia';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { sendOtp, verifyOtp, saveName, loginWithGoogleBackend, fetchMe, logout } from '../service/auth';

interface AuthUser {
    email: string;
    name: string;
}

const IS_PROD = import.meta.env.PROD;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as AuthUser | null,
        loading: false,
        signingOut: false,
        authReady: false,
    }),

    getters: {
        isLoggedIn: (state) => !!state.user,
    },

    actions: {
        async initAuth() {
            try {
                const me = await fetchMe();
                this.user = me ?? null;
            } catch (e) {
                this.user = null;
            } finally {
                this.authReady = true;
            }
        },

        async sendOtp(email: string) {
            this.loading = true;
            try {
                await sendOtp(email);
            } finally {
                this.loading = false;
            }
        },

        async verifyOtp(email: string, code: string) {
            this.loading = true;
            try {
                const result = await verifyOtp(email, code);
                if (!result.needsName) {
                    this.user = { email: result.email, name: result.name };
                }
                return result;
            } finally {
                this.loading = false;
            }
        },

        async saveName(email: string, name: string) {
            this.loading = true;
            try {
                const result = await saveName(email, name);
                this.user = { email: result.email, name: result.name };
            } finally {
                this.loading = false;
            }
        },

         async loginWithGoogle() {
            this.loading = true;
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const { email, displayName } = result.user;
                if (!email) throw new Error('No email from Google');
                const data = await loginWithGoogleBackend(email, displayName ?? '');
                this.user = { email: data.email, name: data.name };
                await firebaseSignOut(auth);
                return this.user;
            } catch (error: any) {
                console.error('[auth] loginWithGoogle error:', error);
                if (error.code === 'auth/popup-closed-by-user') return null;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        setUser(user: { email: string; name: string } | null) {
            this.user = user;
        },

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