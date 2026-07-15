import { getSupabaseUrl } from "@/lib/env";
import { AVATARS_BUCKET } from "@/lib/users/constants";
import { createClient } from "@/lib/supabase/server";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function getAvatarPublicUrl(storagePath: string): string {
  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${AVATARS_BUCKET}/${storagePath}`;
}

function buildAvatarStoragePath(userId: string, mimeType: string): string {
  const extension = EXTENSION_BY_MIME[mimeType] ?? "jpg";
  return `${userId}/avatar.${extension}`;
}

export async function uploadAvatar(
  userId: string,
  avatar: File,
): Promise<{ publicUrl: string | null; error: string | null }> {
  const supabase = await createClient();
  const storagePath = buildAvatarStoragePath(userId, avatar.type);

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(storagePath, avatar, {
      contentType: avatar.type,
      upsert: true,
    });

  if (uploadError) {
    return { publicUrl: null, error: uploadError.message };
  }

  return { publicUrl: getAvatarPublicUrl(storagePath), error: null };
}
