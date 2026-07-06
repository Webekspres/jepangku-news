import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const errorEvent = await request.json();
    
    logger.warn('Logo loading error reported', {
      variant: errorEvent.variant,
      originalSrc: errorEvent.originalSrc,
      fallbackSrc: errorEvent.fallbackSrc,
      url: errorEvent.url,
      userAgent: errorEvent.userAgent,
      timestamp: new Date(errorEvent.timestamp).toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to process logo error analytics', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}