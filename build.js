// tpl.html に Leaflet の CSS と収録データを差し込んで、公開用の HTML を組み立てる。
//   index.html    … GitHub Pages で公開する完全な HTML（これが本番）
//   artifact.html … Claude の Artifact 用（doctype と head は公開時に付くので本体だけ）
// 使い方: node build.js
const fs = require('fs');
const path = require('path');

const dir = __dirname;
let tpl = fs.readFileSync(path.join(dir, 'tpl.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'leaflet.css'), 'utf8');
const seed = fs.readFileSync(path.join(dir, 'seed.packed.json'), 'utf8');

tpl = tpl.replace('/*__LEAFLET_CSS__*/', () => css).replace('/*__SEED__*/null', () => seed);
if (tpl.includes('__LEAFLET_CSS__') || tpl.includes('__SEED__')) throw new Error('差し込み位置が見つかりませんでした');

const head =
  '<!doctype html><html lang="ja"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  '<meta name="description" content="現在地や駅名から近くのラーメン店を地図と一覧で探せるアプリ。施設データは OpenPOI API。">' +
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
  'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>' +
  '</head><body>\n';

fs.writeFileSync(path.join(dir, 'index.html'), head + tpl + '\n</body></html>\n');
fs.writeFileSync(path.join(dir, 'artifact.html'), tpl);

for (const f of ['index.html', 'artifact.html']) {
  console.log(f, fs.statSync(path.join(dir, f)).size, 'bytes');
}
