/**
 * 指定された日時から現在時刻までの経過時間を日本語の相対形式で返す
 * @param date 基準となる日時
 * @returns 「〇分前」「〇時間前」等の文字列
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) {
    return 'たった今';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  } else if (diffInDays < 7) {
    return `${diffInDays}日前`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}週間前`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths}ヶ月前`;
  } else {
    return `${diffInYears}年前`;
  }
}
