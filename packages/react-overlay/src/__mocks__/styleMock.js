/**
 * styleMock.js — мок для CSS-модулей (*.module.scss) в Jest.
 * Возвращает Proxy, который для любого имени класса возвращает само имя.
 * Это позволяет тестам проверять наличие className без реальной компиляции SCSS.
 */
module.exports = new Proxy(
  {},
  {
    get(_, className) {
      return typeof className === 'string' ? className : '';
    },
  }
);

