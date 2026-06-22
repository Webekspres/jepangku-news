import { importSPKI, jwtVerify } from 'jose';

let cachedPublicKey: CryptoKey | null = null;

function envFirst(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function getJwtPublicKeyPem(): string | undefined {
  const raw = envFirst('CORE_JWT_PUBLIC_KEY', 'JEPANGKU_CORE_JWT_PUBLIC_KEY');
  if (!raw) return undefined;
  return raw.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
}

async function getJwtPublicKey(): Promise<CryptoKey> {
  const pem = getJwtPublicKeyPem();
  if (!pem) {
    throw new Error('CORE_JWT_PUBLIC_KEY is not configured');
  }

  if (!cachedPublicKey) {
    cachedPublicKey = await importSPKI(pem, 'RS256');
  }

  return cachedPublicKey;
}

export function isCoreJwtVerifyConfigured(): boolean {
  return Boolean(
    getJwtPublicKeyPem() &&
      envFirst('CORE_JWT_ISSUER', 'JEPANGKU_CORE_JWT_ISSUER') &&
      envFirst('CORE_JWT_AUDIENCE', 'JEPANGKU_CORE_JWT_AUDIENCE'),
  );
}

export async function verifyCoreJwtToken(token: string): Promise<unknown> {
  const issuer = envFirst('CORE_JWT_ISSUER', 'JEPANGKU_CORE_JWT_ISSUER');
  const audience = envFirst('CORE_JWT_AUDIENCE', 'JEPANGKU_CORE_JWT_AUDIENCE');

  if (!issuer || !audience) {
    throw new Error('CORE_JWT_ISSUER and CORE_JWT_AUDIENCE are required');
  }

  const { payload } = await jwtVerify(token, await getJwtPublicKey(), {
    issuer,
    audience,
  });

  return payload;
}
