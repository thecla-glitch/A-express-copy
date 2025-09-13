export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
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


export const getMediaUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`
}
