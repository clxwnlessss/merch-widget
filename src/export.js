(function (root) {
  "use strict";
  function printOrder() { root.print(); }
  async function copyText(text) {
    if (!root.navigator.clipboard?.writeText) {
      throw new Error("Копіювання недоступне. Виділіть текст заявки вручну.");
    }
    await root.navigator.clipboard.writeText(text);
  }
  root.MerchExport = Object.freeze({ printOrder, copyText });
})(globalThis);
