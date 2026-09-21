/**
 * アウトドアブランド候補。
 * 保存形式は原則「日本語名 / 英語名」。表記が同一の場合は1つだけ。
 */
export type OutdoorBrand = {
  ja: string;
  en: string;
};

export const OUTDOOR_BRANDS: OutdoorBrand[] = [
  { ja: "スノーピーク", en: "Snow Peak" },
  { ja: "コールマン", en: "Coleman" },
  { ja: "ロゴス", en: "LOGOS" },
  { ja: "キャプテンスタッグ", en: "CAPTAIN STAG" },
  { ja: "小川", en: "ogawa" },
  { ja: "ユニフレーム", en: "UNIFLAME" },
  { ja: "ソト", en: "SOTO" },
  { ja: "モンベル", en: "mont-bell" },
  { ja: "ディーオーディー", en: "DOD" },
  { ja: "ゼインアーツ", en: "ZANE ARTS" },
  { ja: "ムラコ", en: "muraco" },
  { ja: "テンマクデザイン", en: "tent-Mark DESIGNS" },
  { ja: "サバティカル", en: "SABBATICAL" },
  { ja: "ざぁ～ッス", en: "TheArth" },
  { ja: "東京クラフト", en: "TOKYO CRAFTS" },
  { ja: "ワック", en: "WAQ" },
  { ja: "ヴァストランド", en: "VASTLAND" },
  { ja: "クイックキャンプ", en: "QUICKCAMP" },
  { ja: "ハイランダー", en: "Hilander" },
  { ja: "ヘリノックス", en: "Helinox" },
  { ja: "MSR", en: "MSR" },
  { ja: "ニーモ・イクイップメント", en: "NEMO Equipment" },
  { ja: "ノルディスク", en: "Nordisk" },
  { ja: "ヒルバーグ", en: "Hilleberg" },
  { ja: "テンティピ", en: "Tentipi" },
  { ja: "スタンレー", en: "STANLEY" },
  { ja: "ベアボーンズ", en: "BAREBONES" },
  { ja: "ペトロマックス", en: "Petromax" },
  { ja: "トランギア", en: "Trangia" },
  { ja: "バーゴ", en: "VARGO" },
  { ja: "ジェントス", en: "GENTOS" },
  { ja: "レッドレンザー", en: "Ledlenser" },
  { ja: "イスカ", en: "ISUKA" },
  { ja: "ナンガ", en: "NANGA" },
  { ja: "サーマレスト", en: "THERMAREST" },
  { ja: "バリスティクス", en: "Ballistics" },
  { ja: "オレゴニアンキャンパー", en: "Oregonian Camper" },
  { ja: "アソビト", en: "asobito" },
  { ja: "ロッジ", en: "LODGE" },
  { ja: "岩谷産業", en: "Iwatani" },
  { ja: "ザ・ノース・フェイス", en: "THE NORTH FACE" },
  { ja: "チャムス", en: "CHUMS" },
  { ja: "パタゴニア", en: "patagonia" },
  { ja: "コロンビア", en: "Columbia" },
  { ja: "マムート", en: "MAMMUT" },
  { ja: "アークテリクス", en: "Arc'teryx" },
  { ja: "グレゴリー", en: "GREGORY" },
  { ja: "ワークマン", en: "WORKMAN" },
  { ja: "カインズ", en: "CAINZ" },
  { ja: "尾上製作所", en: "ONOE" },
  { ja: "無印良品", en: "MUJI" },
  { ja: "ダイソー", en: "DAISO" },
  { ja: "キャンドゥ", en: "Can Do" },
  { ja: "セリア", en: "Seria" },
  { ja: "ラーテルワークス", en: "RATEL WORKS" },
  { ja: "バンドック", en: "BUNDOK" },
  { ja: "ワンティグリス", en: "OneTigris" },
  { ja: "エバニュー", en: "EVERNEW" },
  { ja: "プリムス", en: "PRIMUS" },
  { ja: "アシモクラフツ", en: "asimocrafts" },
  { ja: "ネルデザインワークス", en: "neru design works" },
  { ja: "オールドマウンテン", en: "OLD MOUNTAIN" },
  { ja: "デバイスワークス", en: "DEVISE WORKS" },
  { ja: "ロックフィールドイクイップメント", en: "LOCKFIELD EQUIPMENT" },
  { ja: "サンゾー工務店", en: "SANZOKOUMUTEN" },
  { ja: "ソマビト", en: "SomAbito" },
  { ja: "38explore", en: "38explore" },
  { ja: "ボンボネロ", en: "BONBONERO" },
  { ja: "ソルオル", en: "solworks" },
  { ja: "ウォンキーキャンプ", en: "Wantkey camp" },
  { ja: "山のU", en: "山のU" },
  { ja: "グリップスワニー", en: "GRIP SWANY" },
  { ja: "ポストジェネラル", en: "POST GENERAL" },
  { ja: "笑’s", en: "Syo’s" },
];

function normalizeBrandToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u3000/g, " ")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, "");
}

/** DB・UI で使う正規表記（日本語 / 英語） */
export function formatOutdoorBrandLabel(brand: OutdoorBrand): string {
  if (brand.ja === brand.en) {
    return brand.ja;
  }
  return `${brand.ja} / ${brand.en}`;
}

export const OUTDOOR_BRAND_LABELS: string[] = OUTDOOR_BRANDS.map(
  formatOutdoorBrandLabel,
);

function brandMatchTokens(brand: OutdoorBrand): string[] {
  return [brand.ja, brand.en, formatOutdoorBrandLabel(brand)]
    .map(normalizeBrandToken)
    .filter(Boolean);
}

/**
 * 入力が候補に一致すれば正規表記へ寄せる。
 * 一致しなければ trim した入力をそのまま返す。
 */
export function resolveOutdoorBrandLabel(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const normalized = normalizeBrandToken(trimmed);

  for (const brand of OUTDOOR_BRANDS) {
    const tokens = brandMatchTokens(brand);
    if (tokens.includes(normalized)) {
      return formatOutdoorBrandLabel(brand);
    }
  }

  return trimmed;
}

/** 候補フィルタ（日本語・英語・正規表記のいずれかに部分一致） */
export function filterOutdoorBrandLabels(
  query: string,
  limit = 8,
): string[] {
  const normalized = normalizeBrandToken(query);
  if (!normalized) {
    return OUTDOOR_BRAND_LABELS.slice(0, limit);
  }

  const scored = OUTDOOR_BRANDS.map((brand) => {
    const label = formatOutdoorBrandLabel(brand);
    const tokens = brandMatchTokens(brand);
    let score = 0;

    for (const token of tokens) {
      if (token === normalized) {
        score = Math.max(score, 100);
      } else if (token.startsWith(normalized)) {
        score = Math.max(score, 80);
      } else if (token.includes(normalized)) {
        score = Math.max(score, 50);
      }
    }

    return { label, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "ja"));

  return scored.slice(0, limit).map((entry) => entry.label);
}

/** 類似判定用: 「日本語 / 英語」をパーツに分解して正規化 */
export function outdoorBrandSearchTokens(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const parts = trimmed.split(/\s*\/\s*/).map(normalizeBrandToken).filter(Boolean);
  const whole = normalizeBrandToken(trimmed);
  return [...new Set([whole, ...parts])];
}
