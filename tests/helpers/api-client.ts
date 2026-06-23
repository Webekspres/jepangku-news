import { getNewsBaseUrl } from "./server";
import { parseApiResponse } from '@/lib/fetch-api';

export type ApiJson = Record<string, unknown>;

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string | null,
  ) {}

  private buildHeaders(extra?: HeadersInit, body?: BodyInit | null): Headers {
    const headers = new Headers(extra);
    const skipJsonContentType = body instanceof FormData;
    if (!headers.has("Content-Type") && !skipJsonContentType) {
      headers.set("Content-Type", "application/json");
    }
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    return headers;
  }

  url(path: string): string {
    return `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  }

  async request(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = this.buildHeaders(init.headers, init.body ?? null);
    return fetch(this.url(path), { ...init, headers });
  }

  get(path: string, init?: RequestInit) {
    return this.request(path, { ...init, method: "GET" });
  }

  postForm(path: string, formData: FormData, init?: RequestInit) {
    return this.request(path, { ...init, method: "POST", body: formData });
  }

  post(path: string, body?: unknown, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  put(path: string, body?: unknown, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  patch(path: string, body?: unknown, init?: RequestInit) {
    return this.request(path, {
      ...init,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  delete(path: string, init?: RequestInit) {
    return this.request(path, { ...init, method: "DELETE" });
  }

  async json<T = ApiJson>(res: Response): Promise<T> {
    return parseApiResponse<T>(res);
  }

  async envelope(res: Response): Promise<unknown> {
    return res.json();
  }

  async text(res: Response): Promise<string> {
    return res.text();
  }
}

export function createApiClient(token?: string | null): ApiClient {
  return new ApiClient(getNewsBaseUrl(), token);
}

export function guestApi(): ApiClient {
  return createApiClient(null);
}

export function authedApi(token: string): ApiClient {
  return createApiClient(token);
}
