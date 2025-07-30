/**
 * 📅 日時関連のユーティリティ関数
 */

/**
 * 📍 指定された日時から現在までの相対時間を日本語で返す
 * @param date - 基準となる日時
 * @returns 相対時間の文字列（例：「3分前」「2時間前」「1日前」）
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // 📊 時間の単位を定義（ミリ秒）
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  // 🔢 相対時間を計算して適切な単位で返す
  if (diffMs < minute) {
    return '今';
  } else if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes}分前`;
  } else if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours}時間前`;
  } else if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days}日前`;
  } else if (diffMs < month) {
    const weeks = Math.floor(diffMs / week);
    return `${weeks}週間前`;
  } else if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return `${months}ヶ月前`;
  } else {
    const years = Math.floor(diffMs / year);
    return `${years}年前`;
  }
}

/**
 * 📝 詳細な日時情報をツールチップ用に返す
 * @param date - 日時
 * @returns フォーマットされた日時文字列
 */
export function getDetailedDateTime(date: Date): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long'
  });
}
