(function (root) {
  "use strict";
  const catalog = [
    { id: "tshirt", label: "Футболки", options: [
      { id: "tote", label: "Шопер", outputPerItem: 2, unitPriceKop: 4500 },
      { id: "pouch", label: "Косметичка", outputPerItem: 3, unitPriceKop: 3500 }] },
    { id: "hoodie", label: "Худі", options: [
      { id: "backpack", label: "Рюкзак-мішок", outputPerItem: 1, unitPriceKop: 9000 }] },
    { id: "banner", label: "Банери", options: [
      { id: "tote", label: "Шопер", outputPerItem: 4, unitPriceKop: 5500 }] },
    { id: "workwear", label: "Спецодяг", options: [
      { id: "apron", label: "Фартух", outputPerItem: 1, unitPriceKop: 12000 }] }
  ];
  for (const item of catalog) {
    item.options.forEach(Object.freeze); Object.freeze(item.options); Object.freeze(item);
  }
  Object.freeze(catalog);
  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.MerchCatalog = catalog;
})(globalThis);
