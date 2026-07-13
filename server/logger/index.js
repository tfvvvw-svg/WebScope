const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const CURRENT_LEVEL = LOG_LEVELS.INFO;

function timestamp() {
  return new Date().toISOString();
}

export function debug(...args) {
  if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) console.debug(`[${timestamp()}] [DEBUG]`, ...args);
}

export function info(...args) {
  if (CURRENT_LEVEL <= LOG_LEVELS.INFO) console.info(`[${timestamp()}] [INFO]`, ...args);
}

export function warn(...args) {
  if (CURRENT_LEVEL <= LOG_LEVELS.WARN) console.warn(`[${timestamp()}] [WARN]`, ...args);
}

export function error(...args) {
  if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) console.error(`[${timestamp()}] [ERROR]`, ...args);
}