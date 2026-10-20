/** `false` during SSR and in non-browser test environments. */
export function canUseDOM(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
