'use strict';

const espree = require('espree');
const jsx = require('../rules/utils/jsx');

/** Parses `<.../>` and returns the root JSXElement. */
function parseElement(source) {
  const program = espree.parse(source, { ecmaVersion: 2022, ecmaFeatures: { jsx: true } });
  return program.body[0].expression;
}

describe('jsx utils', () => {
  it('reads tag names of DOM elements only', () => {
    expect(jsx.getElementName(parseElement('<main />').openingElement)).toBe('main');
    expect(jsx.getElementName(parseElement('<Layout.Main />').openingElement)).toBeNull();
  });

  it('reads static attribute values from strings and literal expressions', () => {
    const { openingElement } = parseElement('<a href="#main" tabIndex={0} title={label} hidden />');

    expect(jsx.getStaticAttribute(openingElement, 'href')).toBe('#main');
    expect(jsx.getStaticAttribute(openingElement, 'tabIndex')).toBe('0');
    expect(jsx.getStaticAttribute(openingElement, 'title')).toBeNull();
    expect(jsx.getStaticAttribute(openingElement, 'hidden')).toBeNull();
    expect(jsx.getStaticAttribute(openingElement, 'missing')).toBeNull();
  });

  it('detects dynamic attribute values', () => {
    const { openingElement } = parseElement('<a title={label} lang="ru" />');

    expect(jsx.isDynamicValue(jsx.findAttribute(openingElement, 'title'))).toBe(true);
    expect(jsx.isDynamicValue(jsx.findAttribute(openingElement, 'lang'))).toBe(false);
  });

  it.each([
    ['<h1>Text</h1>', true],
    ['<h1>{title}</h1>', true],
    ['<h1><Icon /></h1>', true],
    ['<h1><>x</></h1>', true],
    ['<h1>   </h1>', false],
    ['<h1>{""}</h1>', false],
    ['<h1>{/* comment */}</h1>', false],
  ])('hasContent(%s) -> %s', (source, expected) => {
    expect(jsx.hasContent(parseElement(source))).toBe(expected);
  });

  it('collects static text only', () => {
    expect(jsx.getStaticText(parseElement('<title>Госуслуги {"— главная"}{x}</title>'))).toBe(
      'Госуслуги — главная',
    );
  });

  it('finds descendants through nested elements and fragments', () => {
    const table = parseElement('<table><thead><tr><th>A</th></tr></thead><><th>B</th></></table>');

    expect(jsx.findDescendants(table, 'th')).toHaveLength(2);
    expect(jsx.hasDescendant(table, 'caption')).toBe(false);
  });

  it('recognises presentation roles', () => {
    expect(jsx.hasPresentationRole(parseElement('<table role="none" />').openingElement)).toBe(
      true,
    );
    expect(jsx.hasPresentationRole(parseElement('<table role="grid" />').openingElement)).toBe(
      false,
    );
  });
});
