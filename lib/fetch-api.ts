import {
  isApiErrorBody,
  isApiSuccessBody,
  type ApiErrorBody,
  type ApiSuccessBody,
} from '@/lib/api-response';

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.body = body;
  }
}

export async function readApiJson(response: Response): Promise<unknown> {
  return response.json();
}

export async function parseApiResponse<T = any>(
  response: Response,
): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response, received ${contentType || 'unknown'}`);
  }

  const body: unknown = await response.json();
  if (isApiSuccessBody<T>(body)) return body.data;
  if (isApiErrorBody(body)) {
    throw new ApiClientError(response.status, body);
  }

  return body as T;
}

export async function fetchApi<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  const data = await parseApiResponse<T>(response);
  if (!response.ok) {
    throw new ApiClientError(response.status, {
      success: false,
      message: `HTTP ${response.status}`,
    });
  }
  return data;
}

export async function fetchApiEnvelope<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<ApiSuccessBody<T>> {
  const response = await fetch(input, init);
  const body: unknown = await response.json();

  if (isApiErrorBody(body)) {
    throw new ApiClientError(response.status, body);
  }
  if (isApiSuccessBody<T>(body)) {
    if (!response.ok) {
      throw new ApiClientError(response.status, {
        success: false,
        message: body.message,
      });
    }
    return body;
  }

  if (!response.ok) {
    throw new ApiClientError(response.status, {
      success: false,
      message: `HTTP ${response.status}`,
    });
  }

  return {
    success: true,
    message: 'Request completed successfully.',
    data: body as T,
  };
}
