(function (root) {
  "use strict";
  const app = root.MerchApplication, view = root.MerchView;
  const materials = document.querySelector("#materials");
  const form = document.querySelector("#order-form");
  const invoice = document.querySelector("#invoice");
  const invoiceContent = document.querySelector("#invoice-content");
  const errorBox = document.querySelector("#form-error");
  const ports = { catalog: root.MerchCatalog, now: () => new Date(),
    nextId: () => root.crypto.randomUUID() };
  let currentOrder = null;
  view.renderMaterials(materials, ports.catalog);
  function invalidateOrder() {
    currentOrder = null; invoice.hidden = true;
    document.querySelector("#copy-status").textContent = "";
  }
  function refreshEstimate() {
    invalidateOrder(); errorBox.textContent = "";
    const items = view.readItems(materials);
    view.showQuantityErrors(materials, items);
    try { view.renderEstimate(app.calculateEstimate(items, ports.catalog)); }
    catch (error) {
      view.renderEstimate({ lines: [], totalKop: 0, outputQuantity: 0 });
      errorBox.textContent = error.message;
    }
  }
  form.addEventListener("input", (event) => {
    if (materials.contains(event.target)) refreshEstimate(); else invalidateOrder();
  });
  form.addEventListener("change", (event) => {
    if (materials.contains(event.target)) refreshEstimate();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault(); invalidateOrder(); errorBox.textContent = "";
    try {
      const company = Object.fromEntries(new FormData(form));
      const order = app.createOrder({ company, items: view.readItems(materials) }, ports);
      view.renderInvoice(invoiceContent, order);
      currentOrder = order; invoice.hidden = false;
      invoice.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) { errorBox.textContent = error.message; }
  });
  document.querySelector("#print").addEventListener("click", () => {
    if (currentOrder) root.MerchExport.printOrder();
  });
  document.querySelector("#copy").addEventListener("click", async () => {
    if (!currentOrder) return;
    const status = document.querySelector("#copy-status");
    try { await root.MerchExport.copyText(invoiceContent.innerText); status.textContent = "Текст скопійовано."; }
    catch (error) { status.textContent = error.message; }
  });
  refreshEstimate();
})(globalThis);
