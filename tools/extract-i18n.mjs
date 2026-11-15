// Einmalig: zieht DE/FR/EN-Texte aus einer alten index.html in tools/translations.json
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2], 'utf8');
const dec = s => s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const out = {};
const re = /data-de="([^"]*)"\s+data-fr="([^"]*)"\s+data-en="([^"]*)"/gs;
let m;
while ((m = re.exec(src))) {
  const norm = s => dec(s).replace(/\s+/g,' ').trim();
  out[norm(m[1])] = { fr: norm(m[2]), en: norm(m[3]) };
}
fs.writeFileSync(new URL('./translations.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, 'Einträge');
