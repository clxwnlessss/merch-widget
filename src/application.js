(function (root) {
  "use strict";
  const domain = typeof module !== "undefined" && module.exports ? require("./domain.js") : root.MerchDomain;
  function calculateEstimate(items, catalog) {
    const seen = new Set();
    const lines = items.map((item) => {
      if (seen.has(item.materialId)) throw new domain.ValidationError("Матеріал вказано двічі.");
      seen.add(item.materialId);
      const material = catalog.find((entry) => entry.id === item.materialId);
      const rule = material?.options.find((option) => option.id === item.optionId);
      if (!rule) throw new domain.ValidationError("Невідомий матеріал або варіант переробки.");
      return { materialId: material.id, materialLabel: material.label,
        optionId: rule.id, optionLabel: rule.label, unitPriceKop: rule.unitPriceKop,
        ...domain.calculateLine(item.quantity, rule) };
    }).filter((line) => line.quantity > 0);
    return { lines, ...domain.sumLines(lines) };
  }
  function validateCompany(company) {
    const result = {};
    const limits = { company: 120, contact: 100, email: 160, phone: 40 };
    for (const [field, maxLength] of Object.entries(limits)) {
      const value = company[field] ?? "";
      if (typeof value !== "string" || value.trim().length > maxLength) {
        throw new domain.ValidationError("Некоректні контактні дані.");
      }
      result[field] = value.trim();
    }
    if (!result.company) throw new domain.ValidationError("Вкажіть назву компанії.");
    if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) {
      throw new domain.ValidationError("Перевірте адресу email.");
    }
    return result;
  }
  function createOrder(input, ports) {
    const company = validateCompany(input.company);
    const estimate = calculateEstimate(input.items, ports.catalog);
    if (!estimate.lines.length || !estimate.outputQuantity) {
      throw new domain.ValidationError("Додайте хоча б один виріб для переробки.");
    }
    const date = ports.now();
    return { id: ports.nextId(), createdAt: date.toISOString(), company, ...estimate };
  }
  const api = Object.freeze({ calculateEstimate, validateCompany, createOrder });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MerchApplication = api;
})(globalThis);
