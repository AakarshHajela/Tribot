// ===== EXPORT PDF =====
import { ApiError } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function exportSessionPdf(sessionId: string): Promise<void> {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.replace('/login');
    throw new ApiError('Not authenticated.');
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/triage/sessions/${sessionId}/export.pdf`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (response.status === 401) {
    sessionStorage.removeItem('token');
    window.location.replace('/login');
    throw new ApiError('Session expired.', 401);
  }

  if (!response.ok) {
    let serverMessage: string | undefined;
    try {
      const body = await response.json();
      serverMessage = typeof body?.detail === 'string' ? body.detail : body?.message;
    } catch { /* ignore */ }
    throw new ApiError(
      serverMessage ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${sessionId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
// ===== END EXPORT PDF =====
