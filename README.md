# ラーメンマップ

現在地や駅名から、近くのラーメン店を地図と一覧で探せる Web アプリです。
ビルド済みの `index.html` 1 枚だけで動きます（サーバー不要）。

## 機能

- 現在地から探す（Geolocation）／駅名・地名でエリア検索（入力補完つき）
- 検索半径 500m / 1km / 2km / 5km
- 店名での絞り込み、ジャンル絞り込み（醤油・味噌・塩・豚骨家系・つけ麺・二郎系・担々麺／店名からの推定）
- 近い順の一覧と地図（Leaflet + OpenStreetMap）の連動表示
- 店舗詳細から 食べログ / Google マップ / 経路案内 / X への検索リンク
- お気に入り（ブラウザの localStorage に保存）
- PC は 2 カラム、スマートフォンは一覧／地図のタブ切り替え

## 開発

```
node build.js
```

`tpl.html`（本体）に `leaflet.css` と `seed.packed.json`（初期表示用データ）を差し込み、
`index.html`（公開用の完全な HTML）と `artifact.html`（Claude Artifact 用の本体のみ）を生成します。

初期表示用データを作り直す場合:

```
node seed.js > seed.json
node pack.js .
```

## データについて

施設データは [OpenPOI API](https://openpoiapi.com/) を利用しています（API キー不要・無料・商用利用可）。

API の仕様上の注意点:

- `center` / `radius` / `bbox` は厳密に効かず、店名が完全一致する施設が全国から混ざります。
  そのためアプリ側で中心からの距離を再計算して絞り込んでいます。
- 電話番号・営業時間・評価・写真は返りません。これらは食べログや Google マップのリンク先で確認してください。
- 駅は `category: "station"` として収録されているため、エリア検索に利用しています。

食べログ API は 2014 年 6 月、ぐるなび API の無料提供は 2021 年 6 月に終了しているため、
口コミサイトへは検索リンクで遷移する方式にしています。

## 出典・ライセンス

施設データの出典: [OpenPOI API](https://openpoiapi.com/attribution.html)

含まれるデータソース:

- Overture Maps Foundation, overturemaps.org（CDLA-Permissive-2.0 / CC0-1.0）
- Foursquare OS Places（Apache-2.0）
- 全国の食品営業許可・届出施設のオープンデータ（CC BY 4.0 / PDL1.0 ほか、各自治体）
- 「国土数値情報（鉄道データ N02 / 市区町村役場等 P05 / 公共施設 P29）」（国土交通省）
- 地図タイル: © OpenStreetMap contributors（ODbL）

### NOTICE（Foursquare OS Places / Apache-2.0）

```
Copyright 2024 Foursquare Labs, Inc.

This product includes software developed at Foursquare Labs, Inc.
https://opensource.foursquare.com/places-notice-txt/
```

地図ライブラリ: [Leaflet](https://leafletjs.com/) 1.9.4（BSD-2-Clause）。`leaflet.css` を同梱しています。
