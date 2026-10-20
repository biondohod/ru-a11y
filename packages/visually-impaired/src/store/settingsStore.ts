import { applySettings } from '../dom/applySettings';
import { canUseDOM } from '../dom/env';
import {
  DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
  normalizeSettings,
  type VisuallyImpairedSettings,
} from '../model/settings';
import { VISUALLY_IMPAIRED_STORAGE_KEY } from '../model/theme';
import { persistSettings, readStoredSettings } from './storage';

type Listener = () => void;

/**
 * Module-level store shared by every hook, so all controls on the page stay in
 * sync without a React context provider.
 */
let settings: VisuallyImpairedSettings = readStoredSettings();
const listeners = new Set<Listener>();

function commit(next: VisuallyImpairedSettings, { persist }: { persist: boolean }): void {
  settings = next;
  if (persist) persistSettings(settings);
  applySettings(settings);
  listeners.forEach((listener) => listener());
}

/** Keeps several open tabs in sync. */
function onStorage(event: StorageEvent): void {
  if (event.key === VISUALLY_IMPAIRED_STORAGE_KEY) {
    commit(readStoredSettings(), { persist: false });
  }
}

export function getVisuallyImpairedSettings(): VisuallyImpairedSettings {
  return settings;
}

export function setVisuallyImpairedSettings(next: Partial<VisuallyImpairedSettings>): void {
  commit(normalizeSettings({ ...settings, ...next }), { persist: true });
}

export function resetVisuallyImpairedSettings(): void {
  commit({ ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS }, { persist: true });
}

/** Re-reads saved settings and applies them. Call once on startup when not using the hooks. */
export function initializeVisuallyImpaired(): void {
  commit(readStoredSettings(), { persist: false });
}

/**
 * Subscribes to changes. The first subscriber (re)initialises the store from
 * storage, so mounting many hooks at once does not re-read and re-apply settings
 * once per hook.
 */
export function subscribe(listener: Listener): () => void {
  const isFirst = listeners.size === 0;
  listeners.add(listener);

  if (isFirst) {
    if (canUseDOM()) window.addEventListener('storage', onStorage);
    initializeVisuallyImpaired();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && canUseDOM()) {
      window.removeEventListener('storage', onStorage);
    }
  };
}
