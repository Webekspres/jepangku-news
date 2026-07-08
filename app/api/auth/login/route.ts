import { NextRequest } from 'next/server';
import { authProviderDisabledResponse } from '@/lib/auth';
import { withRequestLogging } from '@/lib/logging/request-logger';

const POST = withRequestLogging(async (_request: NextRequest) => {
  return authProviderDisabledResponse();
});

export { POST };
