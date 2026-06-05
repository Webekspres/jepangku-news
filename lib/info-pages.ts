export const INFO_PAGE_SLUGS = [
  'about',
  'contact',
  'advertise',
  'media-partner',
  'career',
  'internship',
  'privacy-policy',
  'terms-of-service',
  'disclaimer',
] as const;

export type InfoPageSlug = (typeof INFO_PAGE_SLUGS)[number];

export const INFO_PAGE_LABELS: Record<InfoPageSlug, string> = {
  about: 'About',
  contact: 'Contact',
  advertise: 'Advertise',
  'media-partner': 'Media Partner',
  career: 'Career',
  internship: 'Internship',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  disclaimer: 'Disclaimer',
};

export function isInfoPageSlug(slug: string): slug is InfoPageSlug {
  return (INFO_PAGE_SLUGS as readonly string[]).includes(slug);
}
