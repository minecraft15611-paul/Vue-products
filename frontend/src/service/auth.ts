const API = import.meta.env.VITE_API_URL;

export const sendOtp = async (email: string): Promise<void> => {
    const res = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send OTP');
    }
};

export const verifyOtp = async (email: string, code: string) => {
    const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data; // { ok, needsName, email, name? }
};

export const saveName = async (email: string, name: string) => {
    const res = await fetch(`${API}/api/auth/save-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save name');
    return data; // { ok, email, name }
};

export const loginWithGoogleBackend = async (email: string, name: string) => {
    const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google login failed');
    return data; // { ok, email, name }
};

export const fetchMe = async () => {
    const res = await fetch(`${API}/api/auth/me`, {
        credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json(); // { email, name, provider } or null
};

export const logout = async (): Promise<void> => {
    await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
};