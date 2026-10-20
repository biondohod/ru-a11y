'use strict';

const { getRuleMeta } = require('ru-a11y-toolkit-core');

const DOCS_BASE_URL = 'https://github.com/biondohod/ru-a11y/tree/master/packages/eslint-preset';

/**
 * Fills the boilerplate every rule shares: documentation link and the
 * `recommended` flag. Rule authors provide only what is specific to the rule.
 */
function createRule({ name, meta, create }) {
  return {
    meta: {
      ...meta,
      docs: {
        recommended: true,
        url: `${DOCS_BASE_URL}#${name}`,
        ...meta.docs,
      },
      schema: meta.schema ?? [],
    },
    create,
  };
}

/**
 * Builds a report message from the shared rule catalog, so ESLint, the overlay
 * and the CLI describe the same violation with the same words.
 */
function messageFromCatalog(ruleId, referenceField = 'gost') {
  const meta = getRuleMeta(ruleId);
  const fallback = referenceField === 'post102' ? 'Постановление №102' : 'ГОСТ Р 52872-2019';
  const references = [meta[referenceField] ?? fallback, meta.wcag ?? 'WCAG 2.1'];

  return `${meta.title}. ${meta.fix} [${references.join('; ')}]`;
}

function getFilename(context) {
  return context.filename ?? (context.getFilename ? context.getFilename() : '');
}

const PAGE_DIRECTORY = /(?:^|[\\/])(app|pages?|routes?|layouts?)(?:[\\/]|$)/i;
const PAGE_FILE = /(?:app|page|layout|route|screen|view|index)\.[jt]sx?$/i;

/**
 * Page-level checks (one `<main>`, one `<h1>`) only make sense for files that
 * render a whole page, not for every leaf component.
 */
function isPageLikeFile(filename) {
  return PAGE_DIRECTORY.test(filename) || PAGE_FILE.test(filename);
}

/** Reads the first rule option object, so rules never deal with `undefined`. */
function getOptions(context) {
  return context.options[0] || {};
}

module.exports = {
  createRule,
  getFilename,
  getOptions,
  isPageLikeFile,
  messageFromCatalog,
};
