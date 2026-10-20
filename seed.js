// 新宿駅周辺のシードデータを生成する（初期表示用）。フィルタ論理の検証も兼ねる。
const KEYWORDS = ['ラーメン', '麺', '中華そば', 'つけ麺', '家系', '二郎', '担々麺'];

const RAMEN_RE = /(ラーメン|らーめん|らあめん|ラァメン|らぁ麺|らー麺|拉麺|中華そば|中華蕎麦|中華ソバ|つけ麺|つけめん|付け麺|つけそば|まぜそば|混ぜそば|油そば|あぶらそば|麺屋|麺処|麺や|麺家|麺匠|麺創|麺道|麺場|麺者|麺将|製麺|二郎|家系|とんこつ|豚骨|担担麺|担々麺|タンタンメン|タンメン|ramen|一蘭|一風堂|IPPUDO|PPUDO|天下一品|日高屋|幸楽苑|山岡家|魁力屋|丸源|来来亭|壱角家|壹角家|横濱|田中商店|中本|風雲児|ばんから|づゅる|せたが屋|えびそば|風龍|こうかいぼう|喜多方|博多|長浜)/i;
const NG_RE = /(うどん|饂飩|そば処|手打ちそば|立ち食いそば|寿司|すし処|焼肉|焼鳥|やきとり|カフェ|cafe|coffee|パスタ|イタリア|フレンチ|居酒屋|カレー|パン|ベーカリー|洋菓子|ケーキ|洋麺屋|五右衛門|スパゲ|薬局|ドラッグ|美容|理容|サロン|ホテル|学校|駐車場|銀行|歯科|クリニック|病院|書店|ジム|ネイル|保育|神社|寺|公園|交番|郵便|コンビニ|セブン|ローソン|ファミリーマート)/i;
const HARD_NG = /(洋麺屋|五右衛門|スパゲ|パスタ|焼肉|寿司|回転寿司|カフェ|cafe|ベーカリー|薬局|歯科|クリニック)/i;
const OK_CAT = new Set(['restaurant', 'unknown', 'bar_izakaya', '']);

function isRamen(poi) {
  const n = poi.name || '';
  if (!OK_CAT.has(poi.category || '')) return false;
  if (HARD_NG.test(n)) return false;
  if (!RAMEN_RE.test(n)) return false;
  if (NG_RE.test(n) && !/(ラーメン|らーめん|中華そば|つけ麺|麺屋|麺処|製麺|二郎|家系)/.test(n)) return false;
  return true;
}

function dist(lat1, lng1, lat2, lng2) {
  const R = 6371000, r = (x) => (x * Math.PI) / 180;
  const dp = r(lat2 - lat1), dl = r(lng2 - lng1);
  const a = Math.sin(dp / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const normName = (s) =>
  (s || '')
    .normalize('NFKC')
    .replace(/[\s　]+/g, '')
    .replace(/[【】\[\]（）()・,，.。'"”’`~!！?？\-ー−–—_/／]/g, '')
    .toLowerCase();

async function collect(lat, lng, radius) {
  const dLat = radius / 111320;
  const dLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].map((v) => v.toFixed(6)).join(',');
  const out = [];
  for (const kw of KEYWORDS) {
    const url = `https://api.openpoiapi.com/v1/search?q=${encodeURIComponent(kw)}&bbox=${bbox}&limit=200`;
    const res = await fetch(url);
    const json = await res.json();
    out.push(...(json.results || []));
  }
  const kept = [];
  for (const p of out) {
    const d = dist(lat, lng, p.lat, p.lng);
    if (d > radius || !isRamen(p)) continue;
    const key = normName(p.name);
    const dup = kept.find((q) => normName(q.name) === key && dist(q.lat, q.lng, p.lat, p.lng) < 80);
    if (dup) {
      if ((p.address || '').length > (dup.address || '').length) dup.address = p.address;
      for (const a of p.attributions || []) if (!dup.attributions.includes(a)) dup.attributions.push(a);
      continue;
    }
    kept.push({
      name: p.name,
      kana: p.name_kana || '',
      address: p.address || `${p.prefecture || ''}${p.city || ''}`,
      lat: +p.lat.toFixed(6),
      lng: +p.lng.toFixed(6),
      source: p.source,
      attributions: [...(p.attributions || [])],
      d,
    });
  }
  kept.sort((a, b) => a.d - b.d);
  return kept;
}

(async () => {
  const shops = await collect(35.689790, 139.700203, 1000);
  console.error('件数:', shops.length);
  shops.slice(0, 20).forEach((s) => console.error(Math.round(s.d) + 'm', s.name, '|', s.source));
  const slim = shops.map(({ d, ...rest }) => rest);
  process.stdout.write(JSON.stringify(slim));
})();
