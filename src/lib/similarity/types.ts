export const SIMILAR_USERS_LIST_MIN_PERCENT = 70;

export type SimilarityDisplay = {
  percent: number;
  label: SimilarityLabel;
};

export type SimilarityLabel = "同族かも！" | "キャンパーだ！" | "新発見！";

export type SimilarUserListItem = SimilarityDisplay & {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

export type UserContextVector = {
  userId: string;
  experienceYears: string;
  annualFrequency: string;
  companions: string[];
  transport: string;
  primarySeason: string;
  stayDuration: string;
  primaryPurpose: string;
  gearTags: string[];
};
