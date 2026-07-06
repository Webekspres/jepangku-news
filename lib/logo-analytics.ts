/**
 * Analytics dan error tracking untuk logo loading.
 *
 * Client-side only — berjalan di browser.
 * Error dikirim ke endpoint internal yang mencatat via server-side logger.
 */

type LogoErrorEvent = {
  variant: string;
  originalSrc: string;
  fallbackSrc?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
};

class LogoAnalytics {
  private errors: LogoErrorEvent[] = [];
  
  /**
   * Track logo loading error
   */
  trackError(variant: string, originalSrc: string, fallbackSrc?: string) {
    const event: LogoErrorEvent = {
      variant,
      originalSrc,
      fallbackSrc,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
    
    this.errors.push(event);
    
    // Kirim ke monitoring service di semua environment
    this.sendErrorToMonitoring(event);
  }
  
  /**
   * Get error statistics
   */
  getErrorStats() {
    const errorsByVariant = this.errors.reduce((acc, error) => {
      acc[error.variant] = (acc[error.variant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: this.errors.length,
      byVariant: errorsByVariant,
      recent: this.errors.slice(-10),
    };
  }
  
  /**
   * Kirim error ke endpoint analytics internal.
   * Server-side route yang mencatat via Pino logger.
   */
  private sendErrorToMonitoring(event: LogoErrorEvent) {
    if (typeof fetch === 'undefined') return;
    
    try {
      fetch('/api/internal/analytics/logo-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silent fail
      });
    } catch {
      // Silent fail
    }
  }
}

// Singleton instance
export const logoAnalytics = new LogoAnalytics();

/**
 * Helper untuk track error dari komponen
 */
export function trackLogoError(variant: string, originalSrc: string, fallbackSrc?: string) {
  logoAnalytics.trackError(variant, originalSrc, fallbackSrc);
}

/**
 * Get logo error stats (untuk debugging)
 */
export function getLogoErrorStats() {
  return logoAnalytics.getErrorStats();
}