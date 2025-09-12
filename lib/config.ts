export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  API_PREFIX: "/api",
  AUTH_ENDPOINTS: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    PROFILE: "/auth/profile/",
    USERS: "/auth/users/",
    REFRESH: "/auth/token/refresh/",
    UPDATE_PROFILE: "/auth/profile/update/",
  },
} as const


export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`
}


export const getMediaUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`
}
