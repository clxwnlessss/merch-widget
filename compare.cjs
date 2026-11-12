const assert=require('node:assert/strict');
const before=require('./examples/before.js');
const after=require('./src/domain.js');
for(const [q,k,p] of [[100,2,4500],[5,4,5500],[0,2,4500]]){
 const old=before.calc(q,k,p,false,null);const current=after.calculateLine(q,{outputPerItem:k,unitPriceKop:p});
 assert.equal(old.outputQuantity,current.outputQuantity);assert.equal(old.totalKop,current.totalKop);
 console.log(JSON.stringify({input:[q,k,p],before:old,after:current}));
}
console.log('Negative before:',before.calc(-1,2,4500,false,null));
try{after.calculateLine(-1,{outputPerItem:2,unitPriceKop:4500})}catch(e){console.log('Negative after:',e.name)}
