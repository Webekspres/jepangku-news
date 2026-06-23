import { NextResponse } from 'next/server';

export type ApiFieldError = {
  field?: string;
  message: string;
};

export type ApiMeta = Record<string, unknown>;

export type ApiSuccessBody<T> = {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: ApiFieldError[];
  code?: string;
  meta?: ApiMeta;
};

export type ApiSuccessOptions = {
  message?: string;
  meta?: ApiMeta;
  status?: number;
  headers?: HeadersInit;
};

export type ApiErrorOptions = {
  status?: number;
  code?: string;
  errors?: ApiFieldError[];
  meta?: ApiMeta;
  headers?: HeadersInit;
};

const DEFAULT_SUCCESS_MESSAGE = 'Request completed successfully.';

export function apiSuccess<T>(
  data: T,
  options?: ApiSuccessOptions,
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = {
    success: true,
    message: options?.message ?? DEFAULT_SUCCESS_MESSAGE,
    data,
  };
  if (options?.meta) body.meta = options.meta;

  return NextResponse.json(body, {
    status: options?.status ?? 200,
    headers: options?.headers,
  });
}

export function apiError(
  message: string,
  options?: ApiErrorOptions,
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    success: false,
    message,
  };
  if (options?.code) body.code = options.code;
  if (options?.errors?.length) body.errors = options.errors;
  if (options?.meta) body.meta = options.meta;

  return NextResponse.json(body, {
    status: options?.status ?? 400,
    headers: options?.headers,
  });
}

export function apiValidationError(
  message: string,
  errors: ApiFieldError[],
  options?: Omit<ApiErrorOptions, 'errors'>,
): NextResponse<ApiErrorBody> {
  return apiError(message, {
    ...options,
    code: options?.code ?? 'INVALID_INPUT_DATA',
    errors,
  });
}

export function isApiSuccessBody<T>(body: unknown): body is ApiSuccessBody<T> {
  return (
    !!body &&
    typeof body === 'object' &&
    (body as ApiSuccessBody<T>).success === true &&
    'data' in body
  );
}

export function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    !!body &&
    typeof body === 'object' &&
    (body as ApiErrorBody).success === false &&
    'message' in body
  );
}

export function unwrapApiData<T>(body: unknown): T {
  if (isApiSuccessBody<T>(body)) return body.data;
  return body as T;
}
