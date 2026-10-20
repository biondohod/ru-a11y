import {
  DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
  normalizeSettings,
  type VisuallyImpairedSettings,
} from '../model/settings';
import { VISUALLY_IMPAIRED_STORAGE_KEY } from '../model/theme';

/** localStorage, or `null` when it is unavailable (SSR, privacy mode, sandboxed iframes). */
function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredSettings(): VisuallyImpairedSettings {
  try {
    const raw = getStorage()?.getItem(VISUALLY_IMPAIRED_STORAGE_KEY);
    return raw ? normalizeSettings(JSON.parse(raw)) : { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };
  } catch {
    return { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };
  }
}

export function persistSettings(settings: VisuallyImpairedSettings): void {
  try {
    getStorage()?.setItem(VISUALLY_IMPAIRED_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Quota exceeded or storage disabled: the settings still apply for this page view.
  }
}
