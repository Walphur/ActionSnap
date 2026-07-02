const SECRET_KEYS = /secret|token|password|authorization|private_key|api_key|signature/i;

function redactValue(key: string, value: unknown): unknown {
  if (SECRET_KEYS.test(key)) return "[redacted]";
  if (typeof value === "string" && value.length > 80 && /^[A-Za-z0-9+/=_-]+$/.test(value)) {
    return "[redacted]";
  }
  return value;
}

function sanitize(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(sanitize);
  if (data && typeof data === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      out[key] = value && typeof value === "object" ? sanitize(value) : redactValue(key, value);
    }
    return out;
  }
  return data;
}

/** Log estructurado sin secretos ni tokens. */
export function logInfo(scope: string, message: string, context?: Record<string, unknown>) {
  console.info(`[${scope}] ${message}`, context ? sanitize(context) : undefined);
}

export function logWarn(scope: string, message: string, context?: Record<string, unknown>) {
  console.warn(`[${scope}] ${message}`, context ? sanitize(context) : undefined);
}

export function logError(scope: string, message: string, context?: Record<string, unknown>) {
  console.error(`[${scope}] ${message}`, context ? sanitize(context) : undefined);
}
