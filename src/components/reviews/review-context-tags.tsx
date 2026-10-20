interface ReviewContextTagsProps {
  tags: string[];
  isContextPublic: boolean;
  authorId: string;
  currentUserId?: string | null;
  limit?: number;
}

export function ReviewContextTags({
  tags,
  isContextPublic,
  authorId,
  currentUserId = null,
  limit,
}: ReviewContextTagsProps) {
  const canShow = isContextPublic || currentUserId === authorId;
  if (!canShow || tags.length === 0) {
    return null;
  }

  const visible = limit === undefined ? tags : tags.slice(0, limit);

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="このレビューのキャンプ状況">
      {visible.map((tag, index) => (
        <li
          key={`${tag}-${index}`}
          className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
