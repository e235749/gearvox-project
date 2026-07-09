const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "メールアドレスまたはパスワードが正しくありません。",
  "Email not confirmed": "メールアドレスの確認が完了していません。受信トレイをご確認ください。",
  "User already registered": "このメールアドレスは既に登録されています。ログインしてください。",
  "Signup requires a valid password": "有効なパスワードを入力してください。",
  "Password should be at least 6 characters": "パスワードは6文字以上で入力してください。",
};

export function mapAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}
