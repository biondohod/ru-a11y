'use strict';

/**
 * Helpers for inspecting JSX AST nodes. Every custom rule works on the same few
 * questions (what is the tag, does it have this attribute, is it empty), so they
 * live here instead of being re-implemented in each rule.
 */

/** Tag name of a JSX opening element, or `null` for components and member expressions. */
function getElementName(openingElement) {
  const { name } = openingElement;
  return name && name.type === 'JSXIdentifier' ? name.name : null;
}

function findAttribute(openingElement, attributeName) {
  return openingElement.attributes.find(
    (attribute) =>
      attribute.type === 'JSXAttribute' && attribute.name && attribute.name.name === attributeName,
  );
}

function hasAttribute(openingElement, ...attributeNames) {
  return attributeNames.some((attributeName) =>
    Boolean(findAttribute(openingElement, attributeName)),
  );
}

/** `true` when the attribute value is an expression that cannot be evaluated statically. */
function isDynamicValue(attribute) {
  const value = attribute && attribute.value;

  return Boolean(
    value &&
    value.type === 'JSXExpressionContainer' &&
    value.expression &&
    value.expression.type !== 'Literal',
  );
}

/**
 * Statically known attribute value as a string: `attr="x"` and `attr={'x'}` both give `'x'`.
 * Returns `null` for a missing attribute, a valueless attribute or a dynamic expression.
 */
function getStaticValue(attribute) {
  const value = attribute && attribute.value;
  if (!value) return null;
  if (value.type === 'Literal') return String(value.value);
  if (value.type === 'JSXExpressionContainer' && value.expression.type === 'Literal') {
    return String(value.expression.value);
  }
  return null;
}

function getStaticAttribute(openingElement, attributeName) {
  return getStaticValue(findAttribute(openingElement, attributeName));
}

function isBlank(value) {
  return String(value ?? '').trim().length === 0;
}

/**
 * Static text of an element: JSX text and string literals in `{...}`.
 * Dynamic expressions and nested elements are ignored.
 */
function getStaticText(element) {
  return element.children
    .map((child) => {
      if (child.type === 'JSXText') return child.value;
      if (child.type === 'JSXExpressionContainer' && child.expression.type === 'Literal') {
        return String(child.expression.value ?? '');
      }
      return '';
    })
    .join('');
}

/**
 * Whether an element renders something a screen reader can announce. Dynamic
 * expressions (`{title}`) and nested elements count as content: the rule cannot
 * prove them empty, and flagging them would be a false positive.
 */
function hasContent(element) {
  return element.children.some((child) => {
    switch (child.type) {
      case 'JSXText':
        return !isBlank(child.value);
      case 'JSXExpressionContainer':
        if (child.expression.type === 'JSXEmptyExpression') return false;
        if (child.expression.type === 'Literal') return !isBlank(child.expression.value);
        return true;
      default:
        return child.type === 'JSXElement' || child.type === 'JSXFragment';
    }
  });
}

/** Depth-first list of descendant elements with the given tag name. */
function findDescendants(element, tagName) {
  const found = [];

  const visit = (node) => {
    for (const child of node.children || []) {
      if (child.type === 'JSXElement') {
        if (getElementName(child.openingElement) === tagName) found.push(child);
        visit(child);
      } else if (child.type === 'JSXFragment') {
        visit(child);
      }
    }
  };

  visit(element);
  return found;
}

function hasDescendant(element, tagName) {
  return findDescendants(element, tagName).length > 0;
}

function getChildElements(element) {
  return element.children.filter((child) => child.type === 'JSXElement');
}

/** `role="presentation"` / `role="none"` remove the element semantics. */
function hasPresentationRole(openingElement) {
  const role = getStaticAttribute(openingElement, 'role');
  return role === 'presentation' || role === 'none';
}

module.exports = {
  findAttribute,
  findDescendants,
  getChildElements,
  getElementName,
  getStaticAttribute,
  getStaticText,
  getStaticValue,
  hasAttribute,
  hasContent,
  hasDescendant,
  hasPresentationRole,
  isBlank,
  isDynamicValue,
};
