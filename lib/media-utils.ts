import { API_CONFIG } from "./config"

export const getMediaUrl = (path: string): string => {
  if (!path) return "/placeholder-user.jpg"
  
  // If it's already a full URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // Otherwise, prepend the base URL
  return `${API_CONFIG.BASE_URL}${path}`
}