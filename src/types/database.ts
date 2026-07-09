export type AuthProvider = "google" | "apple" | "email";

export type ContextAnswerCategory =
  | "cat2_style"
  | "cat3_season"
  | "cat5_activity"
  | "cat6_space";

export type NotificationType = "like" | "comment" | "follow";

export type ReportTargetType = "review" | "comment" | "user";

export type ReportStatus = "pending" | "resolved" | "dismissed";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  provider: AuthProvider;
  is_public: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserContext {
  id: string;
  user_id: string;
  cat1_companion: string | null;
  cat4_transport: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface ContextAnswer {
  id: string;
  user_id: string;
  category: ContextAnswerCategory;
  answer_value: string;
  created_at: string;
}

export interface GearCategory {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Gear {
  id: string;
  name: string;
  brand: string | null;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  gear_id: string;
  title: string | null;
  body: string;
  rating: number;
  context_snapshot: Record<string, unknown> | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewImage {
  id: string;
  review_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  body: string;
  is_deleted: boolean;
  created_at: string;
}

export interface Like {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string;
  review_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface UserSimilarity {
  id: string;
  user_a_id: string;
  user_b_id: string;
  similarity_score: number;
  calculated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, "id">>;
      };
      user_contexts: {
        Row: UserContext;
        Insert: Omit<UserContext, "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserContext, "id" | "user_id">>;
      };
      context_answers: {
        Row: ContextAnswer;
        Insert: Omit<ContextAnswer, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ContextAnswer, "id" | "user_id">>;
      };
      gear_categories: {
        Row: GearCategory;
        Insert: Omit<GearCategory, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<GearCategory, "id">>;
      };
      gears: {
        Row: Gear;
        Insert: Omit<Gear, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Gear, "id">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at" | "updated_at" | "is_deleted"> & {
          id?: string;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Review, "id" | "user_id">>;
      };
      review_images: {
        Row: ReviewImage;
        Insert: Omit<ReviewImage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ReviewImage, "id" | "review_id">>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at" | "is_deleted"> & {
          id?: string;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<Comment, "id" | "user_id" | "review_id">>;
      };
      likes: {
        Row: Like;
        Insert: Omit<Like, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Like, "id">>;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Follow, "id">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at" | "is_read"> & {
          id?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<Notification, "id" | "user_id">>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "status"> & {
          id?: string;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: Partial<Omit<Report, "id" | "reporter_id">>;
      };
      blocks: {
        Row: Block;
        Insert: Omit<Block, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Block, "id">>;
      };
      user_similarities: {
        Row: UserSimilarity;
        Insert: Omit<UserSimilarity, "id" | "calculated_at"> & {
          id?: string;
          calculated_at?: string;
        };
        Update: Partial<Omit<UserSimilarity, "id">>;
      };
    };
  };
}
