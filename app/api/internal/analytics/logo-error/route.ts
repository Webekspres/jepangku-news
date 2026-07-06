
export async function POST(request: NextRequest) {
  try {
    const errorEvent = await request.json();
    
    // Log the error for debugging purposes
    console.error('Logo loading error reported:', {
      variant: errorEvent.variant,
      originalSrc: errorEvent.originalSrc,
      fallbackSrc: errorEvent.fallbackSrc,
      url: errorEvent.url,
      userAgent: errorEvent.userAgent,
      timestamp: new Date(errorEvent.timestamp).toISOString(),
    });
    
    // In the future, could store in database or send to monitoring service
    // await prisma.logoError.create({ data: errorEvent });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process logo error analytics:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}