export const logout = () => {
  localStorage.removeItem('auth_tokens');
  window.location.href = '/';
};
