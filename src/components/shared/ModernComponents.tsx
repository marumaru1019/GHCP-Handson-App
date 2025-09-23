'use client';

import React from 'react';
import { cn, getButtonClasses, getCardClasses, getBadgeClasses } from '@/lib/design-system';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface ModernCardProps {
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'warning' | 'error';
  children?: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

/**
 * 🎨 最新のCSS機能を活用したモダンカードコンポーネント
 * - Container Queries対応
 * - CSS Grid Layout
 * - 高度なアニメーション
 */
export function ModernCard({ 
  title, 
  description, 
  status, 
  children, 
  interactive = false,
  className 
}: ModernCardProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      badgeColor: 'success' as const,
      label: '完了',
    },
    pending: {
      icon: Clock,
      badgeColor: 'info' as const,
      label: '進行中',
    },
    warning: {
      icon: AlertCircle,
      badgeColor: 'warning' as const,
      label: '注意',
    },
    error: {
      icon: XCircle,
      badgeColor: 'error' as const,
      label: 'エラー',
    },
  };

  const { icon: StatusIcon, badgeColor, label } = statusConfig[status];

  return (
    <div 
      className={cn(
        // 🏗️ Base card styles
        getCardClasses({ elevated: true, interactive }),
        // 📐 Container Queries対応
        'container-queries',
        // 🎭 Modern animations
        'transform transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        // 📱 Responsive padding
        'p-4 @md:p-6',
        // 🎨 Advanced styling
        'backdrop-blur-sm',
        'border-l-4 border-l-primary',
        className
      )}
      style={{
        // 🌈 CSS Custom Properties for dynamic theming
        '--card-accent': 'var(--primary)',
        containerType: 'inline-size',
      } as React.CSSProperties}
    >
      {/* 📋 Header section with CSS Grid */}
      <div className="grid grid-cols-[1fr_auto] items-start gap-4 mb-4">
        <div className="min-w-0"> {/* 🔧 Prevent flex overflow */}
          <h3 className={cn(
            'font-semibold text-gray-900 dark:text-gray-100',
            'truncate', // 📝 Text overflow handling
            '@md:text-lg', // 📐 Container query responsive text
          )}>
            {title}
          </h3>
          <p className={cn(
            'text-sm text-gray-600 dark:text-gray-400 mt-1',
            'line-clamp-2', // 📄 Multi-line text truncation
            '@md:text-base',
          )}>
            {description}
          </p>
        </div>

        {/* 🏷️ Status badge with icon */}
        <div className="flex items-center gap-2">
          <StatusIcon 
            className={cn(
              'w-4 h-4',
              status === 'completed' && 'text-green-600',
              status === 'pending' && 'text-blue-600',
              status === 'warning' && 'text-yellow-600',
              status === 'error' && 'text-red-600',
            )}
          />
          <span className={getBadgeClasses({ color: badgeColor, size: 'sm' })}>
            {label}
          </span>
        </div>
      </div>

      {/* 📦 Content area */}
      {children && (
        <div className={cn(
          'mt-4 pt-4',
          'border-t border-gray-200 dark:border-gray-700',
          // 📐 Container query responsive layout
          '@lg:mt-6 @lg:pt-6',
        )}>
          {children}
        </div>
      )}

      {/* 🎨 Decorative elements */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `
            linear-gradient(
              135deg, 
              transparent 0%, 
              rgba(255, 0, 51, 0.02) 50%, 
              transparent 100%
            )
          `,
        }}
      />
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 🔧 CSS Grid with auto-fit を活用したレスポンシブグリッド
 */
export function ResponsiveGrid({ 
  children, 
  minItemWidth = 280, 
  gap = 'md',
  className 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div 
      className={cn(
        'grid',
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * ⚡ 高度なアニメーションを持つボタンコンポーネント
 */
export function AnimatedButton({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  children, 
  className,
  disabled,
  ...props 
}: AnimatedButtonProps) {
  return (
    <button
      className={cn(
        getButtonClasses({ 
          color: variant, 
          size, 
          disabled: disabled || loading, 
          loading 
        }),
        // 🎭 Advanced animations
        'group relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-white/20',
        'before:translate-x-[-100%] before:transition-transform before:duration-300',
        'hover:before:translate-x-0',
        // 🎯 Focus and interaction states
        'active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* 📦 Content wrapper */}
      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>

      {/* ✨ Ripple effect */}
      <span className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity">
        <span className="absolute inset-0 bg-white/30 rounded-full scale-0 group-active:scale-100 transition-transform duration-300" />
      </span>
    </button>
  );
}

/**
 * 🎨 使用例コンポーネント
 */
export function ModernStylingExample() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        🚀 最新スタイリング手法のサンプル
      </h2>

      {/* 📋 Modern Cards Grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Container Queries対応カード</h3>
        <ResponsiveGrid minItemWidth={300} gap="lg">
          <ModernCard
            title="タスク管理システム"
            description="最新のCSS機能を活用したモダンなUIコンポーネント"
            status="completed"
            interactive
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Container Queriesにより、カードサイズに応じてレスポンシブに対応
            </p>
          </ModernCard>

          <ModernCard
            title="アニメーション強化"
            description="スムーズなトランジションとマイクロインタラクション"
            status="pending"
            interactive
          >
            <div className="flex gap-2">
              <AnimatedButton variant="primary" size="sm">
                実行
              </AnimatedButton>
              <AnimatedButton variant="ghost" size="sm">
                キャンセル
              </AnimatedButton>
            </div>
          </ModernCard>

          <ModernCard
            title="パフォーマンス最適化"
            description="CSS-in-JS からTailwind CSS v4への移行"
            status="warning"
            interactive
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Zero-runtime CSS でバンドルサイズを削減
            </p>
          </ModernCard>
        </ResponsiveGrid>
      </section>

      {/* 🎭 Animation Examples */}
      <section>
        <h3 className="text-lg font-semibold mb-4">高度なアニメーション</h3>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton variant="primary">
            プライマリボタン
          </AnimatedButton>
          <AnimatedButton variant="secondary" loading>
            読み込み中...
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="lg">
            大きなボタン
          </AnimatedButton>
        </div>
      </section>
    </div>
  );
}
