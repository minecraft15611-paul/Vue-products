import { defineStore } from 'pinia';
import type { LoginForm, AuthResponse } from '../schemas/authSchema';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as AuthResponse['user'] | null,
        token: localStorage.getItem('token') || '',
    }),
    actions: {
        async login(formData: LoginForm) {
        // 這裡處理 API 請求
        // const response = await api.post<AuthResponse>('/login', formData);
        console.log('正在向後端傳送驗證過的資料:', formData);
        }
    }
    });