const { test } = require('node:test');
const assert = require('node:assert/strict');
const d = require('../src/domain.js');
const app = require('../src/application.js');
const catalog = require('../src/catalog.js');
const items = [{materialId:'tshirt',optionId:'tote',quantity:100},{materialId:'banner',optionId:'tote',quantity:5}];
const ports = {catalog,now:()=>new Date('2026-11-10T10:00:00Z'),nextId:()=>'TEST-1'};
test('estimate combines catalog rules and lines',()=>{
 const r=app.calculateEstimate(items,catalog); assert.equal(r.totalKop,1010000);assert.equal(r.outputQuantity,220);
});
test('all catalog options calculate expected yield and price',()=>{
 for(const material of catalog)for(const rule of material.options){
  const r=d.calculateLine(2,rule);assert.equal(r.outputQuantity,2*rule.outputPerItem);assert.equal(r.totalKop,2*rule.outputPerItem*rule.unitPriceKop);
 }
});
test('zero is allowed for a line but not an empty order',()=>{
 assert.deepEqual(d.calculateLine(0,catalog[0].options[0]),{quantity:0,outputQuantity:0,totalKop:0});
 assert.throws(()=>app.createOrder({company:{company:'A'},items:[]},ports),/виріб/);
});
test('rejects invalid quantity and oversized input',()=>{
 for(const q of [-1,1.5,NaN,Infinity,'2',1000001])assert.throws(()=>d.calculateLine(q,catalog[0].options[0]),d.ValidationError);
});
test('rejects unknown material or conversion and duplicate materials',()=>{
 assert.throws(()=>app.calculateEstimate([{materialId:'bad',optionId:'tote',quantity:1}],catalog));
 assert.throws(()=>app.calculateEstimate([{materialId:'tshirt',optionId:'bad',quantity:1}],catalog));
 assert.throws(()=>app.calculateEstimate([items[0],items[0]],catalog));
});
test('rejects malformed rules and numeric overflow',()=>{
 for(const rule of [{outputPerItem:0,unitPriceKop:1},{outputPerItem:1,unitPriceKop:-1},{outputPerItem:1,unitPriceKop:1.5},{outputPerItem:Infinity,unitPriceKop:1}])assert.throws(()=>d.calculateLine(1,rule));
 assert.throws(()=>d.calculateLine(1000000,{outputPerItem:2,unitPriceKop:Number.MAX_SAFE_INTEGER}));
 assert.throws(()=>d.sumLines([{outputQuantity:1,totalKop:Number.MAX_SAFE_INTEGER},{outputQuantity:1,totalKop:1}]));
});
test('company validation trims text and checks contact boundaries',()=>{
 assert.equal(app.validateCompany({company:'  A  '}).company,'A');
 for(const company of [{company:' '},{company:'A',email:'bad'},{company:'x'.repeat(121)},{company:'A',phone:42}])assert.throws(()=>app.validateCompany(company));
});
test('order uses injected clock/id and is a snapshot independent of form',()=>{
 const input={company:{company:'Company'},items:structuredClone(items)};
 const before=structuredClone(input);const r=app.createOrder(input,ports);
 assert.equal(r.id,'TEST-1');assert.equal(r.createdAt,'2026-11-10T10:00:00.000Z');assert.deepEqual(input,before);
 input.items[0].quantity=1;input.company.company='Changed';assert.equal(r.lines[0].quantity,100);assert.equal(r.company.company,'Company');
});
test('sum validates its inputs',()=>{
 assert.throws(()=>d.sumLines([{outputQuantity:-1,totalKop:10}]));assert.deepEqual(d.sumLines([]),{totalKop:0,outputQuantity:0});
});
