const ACCESS = 'saas.accessToken';
const REFRESH = 'saas.refreshToken';

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS),
  getRefresh: () => localStorage.getItem(REFRESH),
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS, accessToken);
    localStorage.setItem(REFRESH, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
