const fs=require('fs');
const dir=process.argv[2];
const shops=JSON.parse(fs.readFileSync(dir+'/seed.json','utf8'));
const attr=[];const idx=a=>{let i=attr.indexOf(a);if(i<0){attr.push(a);i=attr.length-1}return i};
const rows=shops.map(s=>[s.name,s.kana,s.address,s.lat,s.lng,s.source,s.attributions.map(idx)]);
const packed={a:attr,r:rows};
fs.writeFileSync(dir+'/seed.packed.json',JSON.stringify(packed));
console.log('shops',rows.length,'attrs',attr.length,'bytes',fs.statSync(dir+'/seed.packed.json').size);
