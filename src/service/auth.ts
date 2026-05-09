import { auth } from '../firebase/config';
import { sendSignInLinkToEmail } from 'firebase/auth';

export const sendLoginLink = async (email: string) => {
    const actionCodeSettings = {
        url: 'http://localhost:5173/Vue-products/login-callback',
        handleCodeInApp: true,
    };

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
    } catch (error) {
        console.error('Firebase 寄信錯誤:', error);
        throw error;
    }
};