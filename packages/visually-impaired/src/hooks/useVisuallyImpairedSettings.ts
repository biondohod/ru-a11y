import { useCallback, useEffect, useState } from 'react';
import type { BooleanSettingKey, VisuallyImpairedSettings } from '../model/settings';
import {
  getVisuallyImpairedSettings,
  resetVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
  subscribe,
} from '../store/settingsStore';

export interface UseVisuallyImpairedSettingsReturn {
  settings: VisuallyImpairedSettings;
  setSettings: (next: Partial<VisuallyImpairedSettings>) => void;
  reset: () => void;
}

/**
 * Current settings plus setters. Every component using it re-renders on change.
 * (A useState-based subscription rather than useSyncExternalStore keeps React 17 support.)
 */
export function useVisuallyImpairedSettings(): UseVisuallyImpairedSettingsReturn {
  const [snapshot, setSnapshot] = useState(getVisuallyImpairedSettings);

  useEffect(() => {
    const unsubscribe = subscribe(() => setSnapshot(getVisuallyImpairedSettings()));
    // The store may have changed between render and subscription.
    setSnapshot(getVisuallyImpairedSettings());
    return unsubscribe;
  }, []);

  return {
    settings: snapshot,
    setSettings: setVisuallyImpairedSettings,
    reset: resetVisuallyImpairedSettings,
  };
}

/** Stable setter and toggle for one boolean setting; `value` is the current value. */
export function useBooleanSetter(
  key: BooleanSettingKey,
  value: boolean,
): [set: (value: boolean) => void, toggle: () => void] {
  const set = useCallback((next: boolean) => setVisuallyImpairedSettings({ [key]: next }), [key]);
  const toggle = useCallback(() => set(!value), [set, value]);

  return [set, toggle];
}
