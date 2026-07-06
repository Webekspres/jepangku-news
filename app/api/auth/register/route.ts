import { NextRequest } from 'next/server';
import { authProviderDisabledResponse } from '@/lib/auth';

export async function POST(_request: NextRequest) {
  return authProviderDisabledResponse();
}
