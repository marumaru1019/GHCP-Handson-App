// 📝 ロガーユーティリティ - 本番環境でのログ制御と将来の拡張性を提供
// 🎯 目的: console.* の直接使用を避け、環境に応じたログレベル制御を実現

/**
 * ログレベル列挙型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * ログメッセージの型定義
 */
type LogMessage = string | number | object | Error;

/**
 * ロガークラス
 * 開発環境では全てのログを出力、本番環境ではdebugログを抑制
 */
class Logger {
  /**
   * 現在の環境が開発環境かどうかを動的に判定
   */
  private get isDevelopment(): boolean {
    // 📊 環境判定: Next.js のランタイムでの NODE_ENV チェック
    return typeof window !== 'undefined' 
      ? process.env.NODE_ENV !== 'production'
      : process.env.NODE_ENV !== 'production';
  }

  /**
   * デバッグログ - 本番環境では出力されない
   * 🐞 開発時のみ有効、パフォーマンス情報や詳細なトレースに使用
   */
  debug(message: LogMessage, ...args: LogMessage[]): void {
    if (this.isDevelopment) {
      console.log(`🐞 [DEBUG]`, message, ...args);
    }
    // 🚫 本番環境では no-op (何もしない)
  }

  /**
   * 情報ログ - 一般的な動作情報
   * 📝 システムの正常な動作を示す情報に使用
   */
  info(message: LogMessage, ...args: LogMessage[]): void {
    console.log(`ℹ️ [INFO]`, message, ...args);
  }

  /**
   * 警告ログ - 問題の可能性があるが動作は継続
   * ⚠️ 注意が必要だが致命的ではない状況に使用
   */
  warn(message: LogMessage, ...args: LogMessage[]): void {
    console.warn(`⚠️ [WARN]`, message, ...args);
  }

  /**
   * エラーログ - エラーや例外の発生
   * ❌ 例外処理やエラー状況で使用
   */
  error(message: LogMessage, ...args: LogMessage[]): void {
    console.error(`❌ [ERROR]`, message, ...args);
  }

  /**
   * 現在の環境情報を取得
   * 🔍 デバッグ用途での環境確認
   */
  getEnvironmentInfo(): { isDevelopment: boolean; nodeEnv: string | undefined } {
    return {
      isDevelopment: this.isDevelopment,
      nodeEnv: process.env.NODE_ENV,
    };
  }
}

// 📦 シングルトンインスタンスをエクスポート
export const logger = new Logger();

// 🚀 将来の拡張用: 外部ログサービス（例：Sentry, LogRocket等）への送信機能を追加可能
// export const setupExternalLogging = (config: ExternalLoggingConfig) => { ... }