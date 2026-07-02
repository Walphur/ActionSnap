/** IA / OCR de dorsales. Pausado en prod con DETECTION_DISABLED=true */
export function isAiTaggingEnabled() {
  return process.env.DETECTION_DISABLED !== "true";
}
