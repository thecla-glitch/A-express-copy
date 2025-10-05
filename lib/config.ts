export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  AUTH_ENDPOINTS: {
    LOGIN: "/login/",
    REGISTER: "/register/",
    PROFILE: "/profile/",
    USERS: "/users/",
    REFRESH: "/token/refresh/",
    UPDATE_PROFILE: "/profile/update/",
  },
} as const

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

const getBaseUrl = (url: string) => {
    if (url.includes('/api')) {
        return url.split('/api')[0];
    }
    return url;
}

export const getMediaUrl = (path: string): string => {
    if (!path) {
        return '';
    }
    if (path.startsWith('http')) {
        return path;
    }
    const baseUrl = getBaseUrl(API_CONFIG.BASE_URL);
    return `${baseUrl}${path}`;
}