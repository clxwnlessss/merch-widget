// Навчальна початкова версія для порівняння; сторінка її не завантажує.
function calc(q, k, p, print, el) {
  // Множимо кількість.
  const n = Math.floor(q * k);
  const s = n * p;
  if (el) el.textContent = s / 100 + ' грн';
  if (print) globalThis.print();
  return { outputQuantity: n, totalKop: s };
}
function calcShirt(q) { return Math.floor(q * 2) * 4500; }
function calcBanner(q) { return Math.floor(q * 4) * 5500; }
function safeCalc(q, k, p) {
  try { return calc(q, k, p, false, null); }
  catch (error) { return null; }
}
if (typeof module !== 'undefined') module.exports = {calc, calcShirt, calcBanner, safeCalc};
