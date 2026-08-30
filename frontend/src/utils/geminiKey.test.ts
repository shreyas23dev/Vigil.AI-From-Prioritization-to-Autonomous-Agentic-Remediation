import {
  getActiveGeminiApiKey,
  resolveInitialGeminiApiKey,
  syncGeminiApiKeyToStorage
} from './geminiKey';

class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

export function runGeminiKeyTests(): boolean {
  const mockStorage = new MockLocalStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true
  });

  // Test 1: Fallback to defaultEnvKey when localStorage is empty
  const key1 = resolveInitialGeminiApiKey('AIzaSy_NEW_KEY_FROM_ENV');
  if (key1 !== 'AIzaSy_NEW_KEY_FROM_ENV') {
    throw new Error(`Test 1 failed: expected AIzaSy_NEW_KEY_FROM_ENV, got ${key1}`);
  }

  // Test 2: Invalidation of stale localStorage key when VITE_GEMINI_API_KEY in .env changes
  mockStorage.setItem('gemini_api_key_env_snapshot', 'OLD_KEY_FROM_PREVIOUS_ENV');
  mockStorage.setItem('gemini_api_key', 'OLD_KEY_FROM_PREVIOUS_ENV');

  const newEnvKey = 'AIzaSy_NEWLY_GENERATED_KEY_123';
  const resolved2 = resolveInitialGeminiApiKey(newEnvKey);

  if (resolved2 !== newEnvKey) {
    throw new Error(`Test 2 failed: expected ${newEnvKey}, got ${resolved2}`);
  }
  if (mockStorage.getItem('gemini_api_key') !== null) {
    throw new Error('Test 2 failed: stale key was not purged from localStorage');
  }

  // Test 3: getActiveGeminiApiKey falls back when custom state key is empty
  const activeFallback = getActiveGeminiApiKey('', 'AIzaSy_ENV_KEY');
  if (activeFallback !== 'AIzaSy_ENV_KEY') {
    throw new Error(`Test 3 failed: expected AIzaSy_ENV_KEY, got ${activeFallback}`);
  }

  // Test 4: syncGeminiApiKeyToStorage removes key when cleared
  mockStorage.setItem('gemini_api_key', 'CUSTOM_KEY');
  syncGeminiApiKeyToStorage('', 'AIzaSy_ENV_KEY');
  if (mockStorage.getItem('gemini_api_key') !== null) {
    throw new Error('Test 4 failed: cleared key was not removed from localStorage');
  }

  console.log('✅ Gemini Key Regression Tests: ALL 4 TESTS PASSED!');
  return true;
}
