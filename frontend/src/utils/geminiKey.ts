/**
 * Utility functions for resolving, syncing, and managing Google Gemini API keys
 * between environment variables (import.meta.env.VITE_GEMINI_API_KEY) and browser localStorage.
 */

export const getActiveGeminiApiKey = (
  customStateKey: string,
  defaultEnvKey: string
): string => {
  const trimmedState = customStateKey.trim();
  if (trimmedState) {
    return trimmedState;
  }
  return (defaultEnvKey || '').trim();
};

export const resolveInitialGeminiApiKey = (defaultEnvKey: string): string => {
  const currentEnv = (defaultEnvKey || '').trim();
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
    return saved.trim();
  }

  return currentEnv;
};

export const syncGeminiApiKeyToStorage = (
  key: string,
  defaultEnvKey: string
): void => {
  if (typeof localStorage === 'undefined') return;
  const trimmed = key.trim();
  const envTrimmed = (defaultEnvKey || '').trim();

  if (trimmed && trimmed !== envTrimmed) {
    localStorage.setItem('gemini_api_key', trimmed);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
};
