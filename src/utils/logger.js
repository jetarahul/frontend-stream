// src/utils/logger.js
export function logInfo(message, data = null) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
}

export function logError(message, error = null) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || "");
}

export function logWarn(message, data = null) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || "");
}
