/** Minimal ANSI styling with `NO_COLOR` and non-TTY support. */
export const ANSI = {
  reset: '\u001B[0m',
  bold: '\u001B[1m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m',
  white: '\u001B[37m',
  gray: '\u001B[90m',
  bgRed: '\u001B[41m',
  bgYellow: '\u001B[43m',
  bgBlue: '\u001B[44m',
} as const;

export type AnsiStyle = (typeof ANSI)[keyof typeof ANSI];

export function supportsColor(): boolean {
  return process.env.NO_COLOR === undefined && process.stdout.isTTY !== false;
}

export function tone(text: string, ...styles: AnsiStyle[]): string {
  return supportsColor() ? `${styles.join('')}${text}${ANSI.reset}` : text;
}

/** Greedy word wrap. Words longer than `width` are kept on their own line. */
export function wrap(text: string, width = 100): string[] {
  if (text.length <= width) {
    return [text];
  }

  const lines: string[] = [];
  let current = '';

  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

export function indentBlock(text: string, indent: string): string[] {
  return text
    .split('\n')
    .flatMap((line) => wrap(line))
    .map((line) => `${indent}${line}`);
}
