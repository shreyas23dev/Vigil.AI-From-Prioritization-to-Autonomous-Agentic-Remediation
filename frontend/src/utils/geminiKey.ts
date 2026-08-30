/**
 * Utility functions for resolving, syncing, and managing Google Gemini API keys
 * between environment variables (import.meta.env.VITE_GEMINI_API_KEY) and browser localStorage.
 */

export const sanitizeApiKey = (rawKey: string): string => {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '').trim();
};

export const isValidGeminiApiKeyFormat = (key: string): boolean => {
  const clean = sanitizeApiKey(key);
  return clean.startsWith('AIzaSy') && clean.length >= 30;
};

export const getActiveGeminiApiKey = (
  customStateKey: string,
  defaultEnvKey: string
): string => {
  const cleanState = sanitizeApiKey(customStateKey);
  if (cleanState) {
    return cleanState;
  }
  return sanitizeApiKey(defaultEnvKey);
};

export const resolveInitialGeminiApiKey = (defaultEnvKey: string): string => {
  const currentEnv = sanitizeApiKey(defaultEnvKey);
  if (typeof localStorage === 'undefined') {
    return currentEnv;
  }

  const lastEnv = localStorage.getItem('gemini_api_key_env_snapshot');

  // If the .env key changed (e.g. user updated VITE_GEMINI_API_KEY in .env),
  // invalidate the stale cached key in localStorage so the new .env key takes precedence.
  if (currentEnv && currentEnv !== lastEnv) {
    localStorage.setItem('gemini_api_key_env_snapshot', currentEnv);
    localStorage.removeItem('gemini_api_key');
    return currentEnv;
  }

  const saved = localStorage.getItem('gemini_api_key');
  if (saved && saved.trim()) {
    return sanitizeApiKey(saved);
  }

  return currentEnv;
};

export const syncGeminiApiKeyToStorage = (
  key: string,
  defaultEnvKey: string
): void => {
  if (typeof localStorage === 'undefined') return;
  const cleanKey = sanitizeApiKey(key);
  const cleanEnv = sanitizeApiKey(defaultEnvKey);

  if (cleanKey && cleanKey !== cleanEnv) {
    localStorage.setItem('gemini_api_key', cleanKey);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
};
