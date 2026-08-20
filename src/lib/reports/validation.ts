import {
  getReportReasonById,
  MAX_REPORT_OTHER_LENGTH,
  REPORT_REASON_OTHER_ID,
} from "@/constants/report-reasons";

import type { ReportTargetType } from "@/lib/reports/types";

export interface SubmitReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reasonId: string;
  otherDetail: string;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function validateSubmitReportInput(
  input: SubmitReportInput,
): string | null {
  if (input.targetType !== "review" && input.targetType !== "comment") {
    return "通報対象が不正です。";
  }

  if (!input.targetId) {
    return "通報対象が指定されていません。";
  }

  if (!isUuid(input.targetId)) {
    return "通報対象が不正です。";
  }

  if (!input.reasonId) {
    return "通報理由を選択してください。";
  }

  const reason = getReportReasonById(input.reasonId);

  if (!reason) {
    return "通報理由が不正です。";
  }

  if (reason.id === REPORT_REASON_OTHER_ID) {
    const detail = input.otherDetail.trim();

    if (!detail) {
      return "「その他」を選んだ場合は詳細を入力してください。";
    }

    if (detail.length > MAX_REPORT_OTHER_LENGTH) {
      return `詳細は${MAX_REPORT_OTHER_LENGTH}文字以内で入力してください。`;
    }
  }

  return null;
}
