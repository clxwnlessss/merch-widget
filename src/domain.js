/* Business rules: no browser or infrastructure dependencies. */
(function (root) {
  "use strict";
  const MAX_INPUT_QUANTITY = 1000000;
  class ValidationError extends Error {
    constructor(message) { super(message); this.name = "ValidationError"; }
  }
  function requireQuantity(value) {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_INPUT_QUANTITY) {
      throw new ValidationError("Кількість: ціле число від 0 до 1 000 000.");
    }
    return value;
  }
  function calculateLine(quantity, rule) {
    requireQuantity(quantity);
    if (!rule || !Number.isFinite(rule.outputPerItem) || rule.outputPerItem <= 0 ||
        !Number.isSafeInteger(rule.unitPriceKop) || rule.unitPriceKop < 0) {
      throw new ValidationError("Некоректні правила каталогу.");
    }
    const outputQuantity = Math.floor(quantity * rule.outputPerItem);
    const totalKop = outputQuantity * rule.unitPriceKop;
    if (!Number.isSafeInteger(outputQuantity) || !Number.isSafeInteger(totalKop)) {
      throw new ValidationError("Сума перевищує допустимий діапазон.");
    }
    return { quantity, outputQuantity, totalKop };
  }
  function sumLines(lines) {
    let totalKop = 0;
    let outputQuantity = 0;
    for (const line of lines) {
      if (!Number.isSafeInteger(line.totalKop) || line.totalKop < 0 ||
          !Number.isSafeInteger(line.outputQuantity) || line.outputQuantity < 0) {
        throw new ValidationError("Некоректна позиція розрахунку.");
      }
      totalKop += line.totalKop;
      outputQuantity += line.outputQuantity;
      if (!Number.isSafeInteger(totalKop) || !Number.isSafeInteger(outputQuantity)) {
        throw new ValidationError("Підсумок перевищує допустимий діапазон.");
      }
    }
    return { totalKop, outputQuantity };
  }
  const api = Object.freeze({ MAX_INPUT_QUANTITY, ValidationError, requireQuantity, calculateLine, sumLines });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MerchDomain = api;
})(globalThis);
