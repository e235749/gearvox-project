export const REPORT_REASON_OTHER_ID = "other";

export const MAX_REPORT_OTHER_LENGTH = 500;

export type ReportReasonOption = {
  id: string;
  label: string;
  requiresDetail?: boolean;
};

export const REPORT_REASONS: ReportReasonOption[] = [
  { id: "spam", label: "スパム・迷惑行為" },
  { id: "harassment", label: "嫌がらせ・誹謗中傷" },
  { id: "discrimination", label: "差別的・攻撃的な内容" },
  { id: "inappropriate", label: "性的・暴力的など不適切な内容" },
  { id: "impersonation", label: "なりすまし" },
  { id: "scam", label: "詐欺・悪質な勧誘" },
  { id: "privacy", label: "個人情報・プライバシーの侵害" },
  { id: "copyright", label: "著作権・知的財産権の侵害" },
  { id: "illegal", label: "危険・違法な行為" },
  {
    id: REPORT_REASON_OTHER_ID,
    label: "その他",
    requiresDetail: true,
  },
];

export function getReportReasonById(
  reasonId: string,
): ReportReasonOption | undefined {
  return REPORT_REASONS.find((reason) => reason.id === reasonId);
}

export function formatReportReasonText(
  reasonId: string,
  otherDetail?: string,
): string {
  const reason = getReportReasonById(reasonId);

  if (!reason) {
    return reasonId;
  }

  if (reason.requiresDetail) {
    return `その他: ${otherDetail?.trim() ?? ""}`;
  }

  return reason.label;
}
