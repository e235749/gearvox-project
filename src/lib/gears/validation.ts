import {
  MAX_GEAR_BRAND_LENGTH,
  MAX_GEAR_NAME_LENGTH,
} from "@/lib/gears/constants";

export interface CreatePendingGearInput {
  name: string;
  brand: string;
  categoryId: string | null;
}

export function parseCreatePendingGearForm(
  formData: FormData,
): CreatePendingGearInput {
  const categoryId = String(formData.get("category_id") ?? "").trim();

  return {
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    categoryId: categoryId || null,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function validateCreatePendingGearInput(
  input: CreatePendingGearInput,
): string | null {
  if (!input.name) {
    return "ギア名を入力してください。";
  }
  if (input.name.length > MAX_GEAR_NAME_LENGTH) {
    return `ギア名は${MAX_GEAR_NAME_LENGTH}文字以内で入力してください。`;
  }
  if (input.brand.length > MAX_GEAR_BRAND_LENGTH) {
    return `ブランド名は${MAX_GEAR_BRAND_LENGTH}文字以内で入力してください。`;
  }
  if (input.categoryId && !isUuid(input.categoryId)) {
    return "カテゴリの指定が不正です。";
  }

  return null;
}

export interface ApproveGearInput {
  gearId: string;
  name: string;
  brand: string;
  categoryId: string | null;
}

export function parseApproveGearForm(formData: FormData): ApproveGearInput {
  const categoryId = String(formData.get("category_id") ?? "").trim();

  return {
    gearId: String(formData.get("gear_id") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    categoryId: categoryId || null,
  };
}

export function validateApproveGearInput(input: ApproveGearInput): string | null {
  if (!input.gearId || !isUuid(input.gearId)) {
    return "ギアが指定されていません。";
  }
  if (!input.name) {
    return "ギア名を入力してください。";
  }
  if (input.name.length > MAX_GEAR_NAME_LENGTH) {
    return `ギア名は${MAX_GEAR_NAME_LENGTH}文字以内で入力してください。`;
  }
  if (input.brand.length > MAX_GEAR_BRAND_LENGTH) {
    return `ブランド名は${MAX_GEAR_BRAND_LENGTH}文字以内で入力してください。`;
  }
  if (input.categoryId && !isUuid(input.categoryId)) {
    return "カテゴリの指定が不正です。";
  }

  return null;
}
