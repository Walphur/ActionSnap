let cloudBlocked = false;
let cloudBlockReason = "";

export function isCloudBlocked() {
  return cloudBlocked;
}

export function getCloudBlockReason() {
  return cloudBlockReason;
}

export function blockCloudApis(reason: string) {
  cloudBlocked = true;
  cloudBlockReason = reason;
}

export function shouldUseCloud() {
  if (cloudBlocked) return false;
  if (process.env.DETECTION_USE_CLOUD !== "true") return false;
  return true;
}

export function markQuotaError(message: string) {
  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("403")
  ) {
    blockCloudApis(
      "APIs de pago sin cuota (Gemini/OpenAI/Vision). Usando OCR local gratis."
    );
  }
}
