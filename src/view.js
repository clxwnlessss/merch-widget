(function (root) {
  "use strict";
  const KOP_PER_UAH = 100;
  const MAX_INPUT_QUANTITY = root.MerchDomain.MAX_INPUT_QUANTITY;
  const money = new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH" });
  function formatMoney(kop) { return money.format(kop / KOP_PER_UAH); }
  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function renderMaterials(container, catalog) {
    container.replaceChildren();
    for (const material of catalog) {
      const row = node("div", undefined, "material"); row.dataset.material = material.id;
      const heading = node("div", undefined, "material-heading");
      const title = node("label", material.label); title.htmlFor = `qty-${material.id}`;
      heading.append(title); row.append(heading);
      const controls = node("div", undefined, "controls");
      const quantityLabel = node("label", "Кількість, шт");
      const quantity = node("input"); quantity.id = `qty-${material.id}`;
      quantity.type = "number"; quantity.min = "0"; quantity.max = String(MAX_INPUT_QUANTITY);
      quantity.step = "1"; quantity.value = "0"; quantity.dataset.quantity = "";
      quantityLabel.htmlFor = quantity.id; quantityLabel.append(quantity);
      const optionLabel = node("label", "Переробити на");
      const select = node("select"); select.id = `option-${material.id}`;
      optionLabel.htmlFor = select.id;
      for (const option of material.options) {
        const choice = node("option", `${option.label} · ${formatMoney(option.unitPriceKop)}/шт`);
        choice.value = option.id; select.append(choice);
      }
      optionLabel.append(select); controls.append(quantityLabel, optionLabel);
      row.append(controls); container.append(row);
    }
  }
  function readItems(container) {
    return Array.from(container.querySelectorAll("[data-material]"), (row) => {
      const input = row.querySelector("input");
      const value = input.value.trim();
      const quantity = value === "" ? NaN : Number(value);
      return { materialId: row.dataset.material, optionId: row.querySelector("select").value, quantity };
    });
  }
  function showQuantityErrors(container, items) {
    for (const item of items) {
      const input = container.querySelector(`#qty-${item.materialId}`);
      const invalid = !Number.isSafeInteger(item.quantity) || item.quantity < 0 ||
        item.quantity > MAX_INPUT_QUANTITY;
      input.setAttribute("aria-invalid", String(invalid));
    }
  }
  function renderEstimate(estimate) {
    document.querySelector("#total").textContent = formatMoney(estimate.totalKop);
    document.querySelector("#output-count").textContent = `${estimate.outputQuantity} аксесуарів`;
    const container = document.querySelector("#breakdown"); container.replaceChildren();
    for (const line of estimate.lines) {
      const row = node("div", undefined, "line");
      row.append(node("span", `${line.materialLabel} → ${line.optionLabel} × ${line.outputQuantity}`),
        node("strong", formatMoney(line.totalKop))); container.append(row);
    }
  }
  function renderInvoice(container, order) {
    container.replaceChildren(node("h2", `Заявка № ${order.id}`),
      node("p", new Date(order.createdAt).toLocaleString("uk-UA")),
      node("p", `Компанія: ${order.company.company}`),
      node("p", [order.company.contact, order.company.email, order.company.phone].filter(Boolean).join(" · ")));
    const table = node("table"); const header = node("tr");
    ["Матеріал", "Виробів", "Аксесуар", "Вихід", "Сума"].forEach((text) => header.append(node("th", text)));
    const head = node("thead"); head.append(header); table.append(head);
    const body = node("tbody");
    for (const line of order.lines) {
      const row = node("tr");
      [line.materialLabel, line.quantity, line.optionLabel, line.outputQuantity, formatMoney(line.totalKop)]
        .forEach((text) => row.append(node("td", text)));
      body.append(row);
    }
    table.append(body); container.append(table, node("h3", `Разом: ${formatMoney(order.totalKop)}`),
      node("p", "Попередній розрахунок. Умови переробки погоджуються з майстернею."));
  }
  root.MerchView = Object.freeze({ renderMaterials, readItems, showQuantityErrors, renderEstimate, renderInvoice });
})(globalThis);
