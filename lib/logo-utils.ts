// Utility untuk logo paths dan fallback handling

export const LOGO_VARIANTS = {
  "01": "/assets/images/logo/logo-01.svg",
  "02": "/assets/images/logo/logo-02.svg", 
  "02-dark": "/assets/images/logo/logo-02-dark.svg",
  "03": "/assets/images/logo/logo-03.svg",
  "04": "/assets/images/logo/logo-04.svg",
  "nihongo": "/assets/images/logo/logo-nihongo.svg",
} as const;

export type LogoVariant = keyof typeof LOGO_VARIANTS;

/**
 * Mendapatkan path logo dengan fallback
 */
export function getLogoPath(variant: LogoVariant, fallbackVariant: LogoVariant = "04"): string {
  return LOGO_VARIANTS[variant] || LOGO_VARIANTS[fallbackVariant];
}

/**
 * Verifikasi apakah logo variant ada
 */
export function isValidLogoVariant(variant: string): variant is LogoVariant {
  return variant in LOGO_VARIANTS;
}

/**
 * Mendapatkan semua path logo untuk preloading
 */
export function getAllLogoPaths(): string[] {
  return Object.values(LOGO_VARIANTS);
}

/**
 * Mendapatkan logo path yang paling sering digunakan untuk preloading
 */
export function getCriticalLogoPaths(): string[] {
  return [
    LOGO_VARIANTS["04"], // Navbar
    LOGO_VARIANTS["02-dark"], // Footer
    LOGO_VARIANTS["01"], // Auth pages
  ];
}