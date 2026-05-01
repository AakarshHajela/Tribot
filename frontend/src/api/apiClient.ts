import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly detail?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthToken(): string | null {
  return sessionStorage.getItem('token');
}

export function clearAuthToken(): void {
  sessionStorage.removeItem('token');
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem('token', token);
}

interface RequestOptions {
  unauthenticated?: boolean;
  timeoutMs?: number;
  noRetry?: boolean;
}

// Helper for the retry delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!options.unauthenticated) {
    const token = getAuthToken();
    if (!token) {
      redirectToLogin();
      throw new ApiError('Not authenticated.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const MAX_RETRIES = options.noRetry ? 0 : 2;
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${BASE_URL}${path}`, { 
        ...init, 
        headers, 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      // Trigger a retry for 500-level server errors
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        throw new Error(`Server Error: ${response.status}`);
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = body?.detail;
        
        let message = 'Request failed';

        // 1. Handle FastAPI list of validation errors
        if (Array.isArray(detail)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message = detail.map((err: any) => err.msg).join(', ');
        } 
        // 2. Handle simple string errors
        else if (typeof detail === 'string') {
          message = detail;
        } 
        // 3. Handle object-based messages
        else if (detail?.message || body?.message) {
          message = detail?.message ?? body?.message;
        }

        // Handle specific status codes
        if (response.status === 401) {
          // FIX: Differentiate between a bad login and an expired token
          if (path.includes('/login')) {
          } else {
             clearAuthToken();
             redirectToLogin();
             toast.error('Session expired. Please log in again.');
             message = 'Session expired.';
          }
        } else if (response.status === 403) {
          toast.error('Access denied: You do not have permission.');
        } else if (response.status === 422) {
          toast.error(`Validation Error: ${message}`);
        } else if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(message);
        }

        throw new ApiError(message, response.status, detail);
      }

      return await response.json() as T;

    } catch (error: any) {
      clearTimeout(timeoutId);

      const isNetworkOrTimeout = 
        error.name === 'AbortError' || 
        error.message.includes('Server Error') || 
        error instanceof TypeError; 

      if (isNetworkOrTimeout && attempt < MAX_RETRIES) {
        console.warn(`Connection failed. Retrying attempt ${attempt + 1}...`);
        await delay(1000 * (attempt + 1));
        continue;
      }

      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection.');
        throw new ApiError('Timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      toast.error('Network error. Failed to connect to server.');
      throw new ApiError(error.message || 'Network request failed');
    }
  }
  
  throw new Error("Unreachable");
}

function redirectToLogin(): void {
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

export const apiClient = {
  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, options);
  },
  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, options);
  },
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { method: 'GET' }, options);
  },
};