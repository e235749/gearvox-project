export const EXPERIENCE_YEARS_OPTIONS = [
  "初めて / 1年未満",
  "1年〜3年未満",
  "3年〜5年未満",
  "5年以上",
  "10年以上",
] as const;

export const ANNUAL_FREQUENCY_OPTIONS = [
  "年に1〜2回",
  "年に3〜5回",
  "年に6〜10回",
  "月1回以上（年12回以上）",
] as const;

export const COMPANION_OPTIONS = [
  "ソロ（1人）",
  "デュオ（2人）",
  "ファミリー（3〜5人）",
  "たくさん（6人以上）",
  "グループ（テントは別）",
  "ペット同伴",
] as const;

export const TRANSPORT_OPTIONS = [
  "公共交通機関・徒歩",
  "自転車",
  "バイク",
  "軽自動車",
  "普通車",
] as const;

export const PRIMARY_SEASON_OPTIONS = [
  "春・秋",
  "夏",
  "冬",
  "厳冬期（雪中等）",
] as const;

export const STAY_DURATION_OPTIONS = [
  "0泊（日帰り・デイキャンプ）",
  "1泊",
  "連泊（2泊以上）",
] as const;

export const PRIMARY_PURPOSE_OPTIONS = [
  "キャンプ飯・本格調理",
  "ツーリング",
  "ブッシュクラフト",
  "フェス・イベント",
  "特に目的を絞らずのんびり過ごす（チル）",
  "自然を楽しむ",
] as const;

export const GEAR_TAG_OPTIONS = [
  "初心者向け（設営・使いやすさ）",
  "軽量性",
  "携帯性・収納サイズ",
  "快適性・居住性",
  "耐久性・頑丈さ",
  "コストパフォーマンス（価格）",
  "外観・デザイン性",
  "ロースタイル",
  "ハイスタイル",
  "新規性",
] as const;

export const OTHER_OPTION = "その他" as const;

export type ExperienceYearsOption = (typeof EXPERIENCE_YEARS_OPTIONS)[number];
export type AnnualFrequencyOption = (typeof ANNUAL_FREQUENCY_OPTIONS)[number];
export type CompanionOption = (typeof COMPANION_OPTIONS)[number];
export type TransportOption = (typeof TRANSPORT_OPTIONS)[number];
export type PrimarySeasonOption = (typeof PRIMARY_SEASON_OPTIONS)[number];
export type StayDurationOption = (typeof STAY_DURATION_OPTIONS)[number];
export type PrimaryPurposeOption = (typeof PRIMARY_PURPOSE_OPTIONS)[number];
export type GearTagOption = (typeof GEAR_TAG_OPTIONS)[number];

export const MAX_COMPANION_SELECTIONS = 2;
export const MAX_GEAR_TAG_SELECTIONS = 3;
export const MAX_OTHER_TEXT_LENGTH = 50;

export const CONTEXT_QUESTIONNAIRE_INTRO = {
  title: "キャンプギア選定に関するコンテキストアンケート",
  description:
    "利用者の状況や目的に合わせた「最適なキャンプギアの選定・レビュー検索のサポート」の開発を目的とした研究アンケートです。ご自身の直近のキャンプ計画（または普段のキャンプスタイル）を思い浮かべてご回答ください。",
  duration: "所要時間：約2分",
} as const;

export const CONTEXT_QUESTIONNAIRE_STEPS = [
  {
    key: "experience_years",
    label: "キャンプ経験年数",
    description: "あなたのキャンプ経験年数を教えてください。",
    type: "single",
  },
  {
    key: "annual_frequency",
    label: "年間キャンプ回数",
    description: "年間でどのくらいキャンプに行きますか？",
    type: "single",
  },
  {
    key: "companions",
    label: "同行者・規模",
    description: "キャンプの同行者・規模を選択してください。",
    hint: "最大2つまで選択できます。",
    type: "multi",
    maxSelect: MAX_COMPANION_SELECTIONS,
  },
  {
    key: "transport",
    label: "移動手段",
    description: "移動手段（積載手段）を選択してください。",
    type: "single-with-other",
  },
  {
    key: "primary_season",
    label: "よくキャンプする季節",
    description: "一番キャンプに行く機会が多い季節を選んでください。",
    type: "single",
  },
  {
    key: "stay_duration",
    label: "滞在スタイル",
    description: "キャンプをよくする「期間（滞在数）」を選択してください。",
    type: "single",
  },
  {
    key: "primary_purpose",
    label: "キャンプの目的",
    description: "キャンプで最も重視する目的を選択してください。",
    type: "single-with-other",
  },
  {
    key: "gear_tags",
    label: "ギア選定の重視点",
    description:
      "キャンプギアの選定で特に重視したい「タグ」を選択してください。",
    hint: "最大3つまで選択できます。",
    type: "multi-with-other",
    maxSelect: MAX_GEAR_TAG_SELECTIONS,
  },
] as const;

export type ContextQuestionnaireStepKey =
  (typeof CONTEXT_QUESTIONNAIRE_STEPS)[number]["key"];
