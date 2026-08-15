export type BlockActionResult = {
  success: boolean;
  error?: string;
  isBlocked?: boolean;
};

export type BlockedUserItem = {
  blockedId: string;
  displayName: string;
  avatarUrl: string | null;
  blockedAt: string;
};
