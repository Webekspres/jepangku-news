/**
 * Analytics dan error tracking untuk logo loading
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
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(event);
    } else {
      // In development, log to console
      console.warn('Logo loading error:', event);
    }
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
   * Send error to monitoring service
   */
  private sendErrorToMonitoring(event: LogoErrorEvent) {
    // TODO: Integrate with monitoring service like Sentry, DataDog, etc.
    // For now, just log critical errors
    console.error('Critical logo loading error:', {
      variant: event.variant,
      src: event.originalSrc,
      url: event.url,
    });
    
    // Could also send to analytics endpoint
    if (typeof fetch !== 'undefined') {
      try {
        fetch('/api/internal/analytics/logo-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }).catch(() => {
          // Silent fail for analytics
        });
      } catch {
        // Silent fail for analytics
      }
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