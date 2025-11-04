const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function iFetch(url: string, options?: RequestInit) {
  return fetch(url, options).catch(() => new Response('{}', { status: 503, statusText: 'Service Unavailable', }));
}

export async function getApi<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const response = await iFetch(`${API_BASE_URL}${path}` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v.toString()])).toString() : ''));
  return response.json();
}

export async function postApi<T>(path: string, body: Record<string, any>): Promise<T> {
  const response = await iFetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
} 