import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "CHECKOUT_UNAVAILABLE"
  | "PHOTOS_UNAVAILABLE"
  | "PHOTO_SALE_CONFLICT"
  | "PAYMENT_NOT_CONFIGURED"
  | "PAYMENT_PROVIDER_ERROR"
  | "INTERNAL_ERROR";

export type ApiErrorBody = {
  success: false;
  error: string;
  code: ApiErrorCode;
  details?: Record<string, unknown>;
  hint?: string;
};

export type ApiSuccessBody<T extends Record<string, unknown> = Record<string, unknown>> = {
  success: true;
} & T;

export function apiError(
  status: number,
  code: ApiErrorCode,
  error: string,
  opts?: { details?: Record<string, unknown>; hint?: string }
) {
  const body: ApiErrorBody = {
    success: false,
    error,
    code,
    ...(opts?.details ? { details: opts.details } : {}),
    ...(opts?.hint ? { hint: opts.hint } : {}),
  };
  return NextResponse.json(body, { status });
}

export function apiSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data } satisfies ApiSuccessBody<T>, { status });
}
