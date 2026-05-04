import { auth } from '../firebase/config';
import { sendSignInLinkToEmail } from 'firebase/auth';

export const sendLoginLink = async (email: string) => {
    const actionCodeSettings = {
        // 這裡填寫你 Vue 專案運行的網址，驗證完後會跳轉回來
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