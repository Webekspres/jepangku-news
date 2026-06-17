import type { ContributorApplicationStatus } from '@prisma/client';
import type { SessionUser } from '@/lib/auth/types';

export const CONTRIBUTOR_APPLY_PATH = '/contributor/apply';

export const CONTRIBUTOR_REQUIRED_ERROR = {
  error: 'Contributor access required',
  code: 'CONTRIBUTOR_REQUIRED',
} as const;

export type ContributorCapableUser =
  | (Pick<SessionUser, 'role'> & {
      contributorApplicationStatus?: ContributorApplicationStatus | null;
    })
  | null
  | undefined;

/** Admin and approved contributors may create and manage their articles. */
export function canCreateArticles(user: ContributorCapableUser): boolean {
  if (!user) return false;
  return user.role === 'ADMIN' || user.role === 'CONTRIBUTOR';
}

export function isApprovedContributor(user: ContributorCapableUser): boolean {
  return canCreateArticles(user);
}

export type ContributorCta = {
  href: string;
  label: string;
  disabled?: boolean;
};

export function getContributorCta(user: ContributorCapableUser): ContributorCta {
  if (isApprovedContributor(user)) {
    return { href: '/submit-article', label: 'Buat Artikel' };
  }

  if (user?.contributorApplicationStatus === 'PENDING') {
    return {
      href: CONTRIBUTOR_APPLY_PATH,
      label: 'Permohonan Diproses',
      disabled: true,
    };
  }

  if (user?.contributorApplicationStatus === 'REJECTED') {
    return {
      href: CONTRIBUTOR_APPLY_PATH,
      label: 'Ajukan Ulang Kontributor',
    };
  }

  return {
    href: CONTRIBUTOR_APPLY_PATH,
    label: 'Daftar sebagai Kontributor',
  };
}
