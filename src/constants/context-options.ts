export const COMPANION_OPTIONS = [
  "ソロ",
  "デュオ",
  "ファミリー小",
  "ファミリー大",
  "グループ",
  "ペット同伴",
] as const;

export const STYLE_OPTIONS = [
  "初心者",
  "上級者",
  "軽量",
  "耐久性",
  "快適性",
  "携帯性",
  "ミニマリスト",
  "コスト",
  "外観",
  "ロースタイル",
  "ハイスタイル",
] as const;

export const SEASON_OPTIONS = [
  "春秋",
  "夏",
  "冬",
  "厳冬期",
  "1泊メイン",
  "連泊メイン",
] as const;

export const TRANSPORT_OPTIONS = [
  "バイク",
  "軽自動車",
  "普通車・SUV",
  "公共交通機関・徒歩",
] as const;

export const ACTIVITY_OPTIONS = [
  "キャンプ飯重視",
  "登山併用",
  "ツーリング",
  "ブッシュクラフト",
  "フェス",
] as const;

export const SPACE_OPTIONS = [
  "オートキャンプ場",
  "フリーサイト",
  "山岳・林間サイト",
  "無料・野営地",
  "グランピング",
  "RVパーク",
] as const;

export type CompanionOption = (typeof COMPANION_OPTIONS)[number];
export type StyleOption = (typeof STYLE_OPTIONS)[number];
export type SeasonOption = (typeof SEASON_OPTIONS)[number];
export type TransportOption = (typeof TRANSPORT_OPTIONS)[number];
export type ActivityOption = (typeof ACTIVITY_OPTIONS)[number];
export type SpaceOption = (typeof SPACE_OPTIONS)[number];

export const CONTEXT_QUESTIONNAIRE_STEPS = [
  { step: 1, key: "welcome", label: "ウェルカム" },
  { step: 2, key: "companion", label: "関係的（同行者）", maxSelect: 1 },
  { step: 3, key: "style", label: "個人的（こだわり）", maxSelect: 3 },
  { step: 4, key: "season", label: "時間的（季節・期間）" },
  { step: 5, key: "transport", label: "人工的（移動手段）", maxSelect: 1 },
  { step: 6, key: "activity", label: "アクティビティ（目的）", maxSelect: 3 },
  { step: 7, key: "space", label: "空間的（場所）" },
  { step: 8, key: "summary", label: "サマリー確認" },
] as const;
