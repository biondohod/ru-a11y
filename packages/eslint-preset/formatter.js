'use strict';

const ANSI = {
  reset: '\u001B[0m',
  bold: '\u001B[1m',
  dim: '\u001B[2m',
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
};

function supportsColor() {
  return process.env.NO_COLOR === undefined && process.stdout.isTTY !== false;
}

function tone(text, ...styles) {
  if (!supportsColor()) {
    return text;
  }

  return `${styles.join('')}${text}${ANSI.reset}`;
}

function wrap(text, width = 100) {
  if (!text || text.length <= width) {
    return [text || ''];
  }

  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = candidate;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function indentBlock(text, indent) {
  return String(text)
    .split('\n')
    .flatMap((line) => wrap(line))
    .map((line) => `${indent}${line}`);
}

function formatLabel(label) {
  return tone(label, ANSI.bold, ANSI.cyan);
}

function highlightSnippet(snippet) {
  return snippet
    .replace(/(&lt;|<)\/?([A-Za-z][\w:-]*)/g, (match, bracket, tag) =>
      `${tone(bracket, ANSI.gray)}${tone(match.slice(bracket.length), ANSI.bold, ANSI.magenta)}`
    )
    .replace(/([A-Za-z_:-]+)=(".*?"|'.*?'|\{.*?\})/g, (_, attr, value) =>
      `${tone(attr, ANSI.blue)}=${tone(value, ANSI.yellow)}`
    );
}

function formatInlineCode(text) {
  return String(text)
    .replace(/`([^`]+)`/g, (_, code) => tone(code, ANSI.bold, ANSI.yellow))
    .replace(/(<[^>]+>)/g, (tag) => highlightSnippet(tag));
}

function formatSeverity(severity) {
  if (severity === 2) {
    return tone(' ERROR ', ANSI.bold, ANSI.white, ANSI.bgRed);
  }

  if (severity === 1) {
    return tone(' WARN ', ANSI.bold, ANSI.white, ANSI.bgYellow);
  }

  return tone(' INFO ', ANSI.bold, ANSI.white, ANSI.bgBlue);
}

function splitMessage(message) {
  const normalized = String(message || '').trim();
  const refsMatch = normalized.match(/\[([^[\]]+)\]\s*$/);
  const refsText = refsMatch ? refsMatch[1].trim() : '';
  const body = refsMatch ? normalized.slice(0, refsMatch.index).trim() : normalized;

  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const errorText = sentences[0] || body;
  const recommendation = sentences.slice(1).join(' ').trim();

  const refs = refsText
    ? refsText
        .split(/\s*;\s*/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    errorText,
    recommendation,
    refs,
  };
}

function formatSourceSnippet(result, message) {
  if (!result || !result.source || !message || !message.line) {
    return [];
  }

  const sourceLines = result.source.split(/\r?\n/);
  const snippet = sourceLines[message.line - 1];

  if (!snippet) {
    return [];
  }

  const lineNumber = String(message.line).padStart(4, ' ');
  const column = Math.max(1, message.column || 1);

  return [
    formatLabel('Фрагмент кода'),
    `        ${tone(lineNumber, ANSI.gray)} ${highlightSnippet(snippet)}`,
    `             ${' '.repeat(column - 1)}${tone('^', ANSI.bold, ANSI.red)}`,
  ];
}

function formatMessage(result, message, index) {
  const parsed = splitMessage(message.message);
  const location = `${result.filePath}:${message.line || '?'}:${message.column || '?'}`;
  const lines = [];

  lines.push(
    `    ${tone(`Нарушение #${index}`, ANSI.bold, ANSI.magenta)} ${formatSeverity(message.severity)} ${tone(message.ruleId || 'unknown-rule', ANSI.bold, ANSI.blue)}`
  );
  lines.push(`      ${formatLabel('Где')}: ${tone(location, ANSI.yellow)}`);
  lines.push(`      ${formatLabel('Текст ошибки')}:`);
  lines.push(...indentBlock(formatInlineCode(parsed.errorText), '        '));

  if (parsed.recommendation) {
    lines.push(`      ${formatLabel('Рекомендация по исправлению')}:`);
    lines.push(...indentBlock(formatInlineCode(parsed.recommendation), '        '));
  }

  if (parsed.refs.length > 0) {
    lines.push(`      ${formatLabel('Нормативные требования')}:`);
    parsed.refs.forEach((ref) => {
      lines.push(...indentBlock(`• ${formatInlineCode(ref)}`, '        '));
    });
  }

  lines.push(...formatSourceSnippet(result, message));

  return lines;
}

module.exports = function ruA11yFormatter(results) {
  const errorCount = results.reduce((sum, result) => sum + (result.errorCount || 0), 0);
  const warningCount = results.reduce((sum, result) => sum + (result.warningCount || 0), 0);
  const relevantResults = results.filter((result) => Array.isArray(result.messages) && result.messages.length > 0);

  const lines = [];
  lines.push(tone('ru-a11y ESLint report', ANSI.bold, ANSI.white));
  lines.push(tone('═'.repeat(72), ANSI.gray));
  lines.push(`${formatLabel('Файлов с нарушениями')}: ${tone(String(relevantResults.length), ANSI.bold)}`);
  lines.push(`${formatLabel('Ошибок')}: ${tone(String(errorCount), ANSI.bold, errorCount > 0 ? ANSI.red : ANSI.green)}`);
  lines.push(`${formatLabel('Предупреждений')}: ${tone(String(warningCount), ANSI.bold, warningCount > 0 ? ANSI.yellow : ANSI.green)}`);
  lines.push('');

  relevantResults.forEach((result) => {
    lines.push(`${tone('Файл', ANSI.bold, ANSI.white)} ${tone(result.filePath, ANSI.cyan)}`);

    const messages = result.messages
      .filter((message) => message && message.severity > 0)
      .sort((a, b) => (a.line || 0) - (b.line || 0) || (a.column || 0) - (b.column || 0));

    messages.forEach((message, index) => {
      lines.push(...formatMessage(result, message, index + 1));
      lines.push('');
    });
  });

  if (relevantResults.length === 0) {
    lines.push(tone('Нарушений не обнаружено.', ANSI.green));
  }

  return `${lines.join('\n').trimEnd()}\n`;
};
