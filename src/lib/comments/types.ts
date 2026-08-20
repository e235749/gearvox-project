export type ReviewComment = {
  id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    display_name: string;
  };
};

export type CommentActionResult = {
  success: boolean;
  error?: string;
  comment?: ReviewComment;
  commentCount?: number;
};

export type FetchCommentsResult = {
  success: boolean;
  error?: string;
  comments?: ReviewComment[];
};
