/**
 * Splits a comma separated flag value, ignoring commas inside glob braces:
 * `src/**\/*.{js,jsx},tests/**` -> [`src/**\/*.{js,jsx}`, `tests/**`].
 */
export function splitList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const chunks: string[] = [];
  let current = '';
  let braceDepth = 0;

  const flush = () => {
    const chunk = current.trim();
    if (chunk) {
      chunks.push(chunk);
    }
    current = '';
  };

  for (const char of value) {
    if (char === '{') {
      braceDepth += 1;
    } else if (char === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
    } else if (char === ',' && braceDepth === 0) {
      flush();
      continue;
    }

    current += char;
  }

  flush();
  return chunks;
}
