import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import {
  getStaticEmailTemplateList,
  listEmailTemplateConfigs,
} from '@/lib/email/template-config';

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const templates = await listEmailTemplateConfigs();
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ templates: getStaticEmailTemplateList() });
  }
}
