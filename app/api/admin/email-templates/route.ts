import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import {
  getStaticEmailTemplateList,
  listEmailTemplateConfigs,
} from '@/lib/email/template-config';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  try {
    const templates = await listEmailTemplateConfigs();
    return apiSuccess({ templates });
  } catch {
    return apiSuccess({ templates: getStaticEmailTemplateList() });
  }
}
