import { defineStore } from 'pinia';
import type { User } from 'firebase/auth';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { sendLoginLink } from '../service/auth';
import type { LoginForm } from '../schemas/authSchema';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        loading: false,
        signingOut: false,
    }),
    actions: {
        async login(formData: LoginForm) {
            this.loading = true;
            try {
                await sendLoginLink(formData.email);
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        setUser(user: User) {
            this.user = user;
        },

        async signOut() {
            const router = useRouter();
            try {
                this.signingOut = true;
                await firebaseSignOut(auth);
                this.user = null;
                await new Promise(resolve => setTimeout(resolve, 800));
                router.push('/LoginView');
            } catch (error) {
                console.error('Sign out error:', error);
            } finally {
                this.signingOut = false;
            }
        },

        clearUser() {
            this.user = null;
        }
    }
});