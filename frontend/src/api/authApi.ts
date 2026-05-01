import { apiClient, setAuthToken, clearAuthToken } from './apiClient';

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'clinician';
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>('/api/v1/auth/me');
}

/**
 * Authenticates the user and stores the token.
 * Returns the resolved CurrentUser so callers can set state immediately.
 */
export async function login(credentials: LoginCredentials): Promise<CurrentUser> {
  const data = await apiClient.post<LoginResponse>(
    '/api/v1/auth/login',
    credentials,
    { unauthenticated: true },
  );
  setAuthToken(data.access_token);
  return fetchCurrentUser();
}

export function logout(): void {
  clearAuthToken();
  window.location.replace('/login');
}

// ===== CHANGE PASSWORD =====
export function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/api/v1/auth/change-password', {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
  });
}
// ===== END CHANGE PASSWORD =====