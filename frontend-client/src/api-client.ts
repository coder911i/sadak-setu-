import { ApiResponse } from './types';

export class ApiClient {
  private baseUrl: string;
  private tokenGetter: () => string | null;
  private tokenSetter: (token: string) => void;
  private onUnauthorized?: () => void;

  constructor(options: {
    baseUrl?: string;
    getToken: () => string | null;
    setToken: (token: string) => void;
    onUnauthorized?: () => void;
  }) {
    this.baseUrl = options.baseUrl || 'http://localhost:5000/api/v1';
    this.tokenGetter = options.getToken;
    this.tokenSetter = options.setToken;
    this.onUnauthorized = options.onUnauthorized;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.tokenGetter();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...((options.headers as Record<string, string>) || {}),
    };

    // If body is FormData (e.g. file upload), let browser set multipart boundaries
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
    }

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      const errorMsg = json.error?.message || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return json;
  }

  get<T>(endpoint: string, query?: Record<string, any>) {
    let url = endpoint;
    if (query) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.append(k, String(v));
      });
      const qStr = params.toString();
      if (qStr) url += `?${qStr}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
