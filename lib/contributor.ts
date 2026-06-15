/** Placeholder until Fase A″ (contributor role + waiting list). */
export const CONTRIBUTOR_APPLY_PATH = "/contributor/apply";

type ContributorRoleUser = { role: "USER" | "ADMIN" } | null | undefined;

/** Fase A″: ganti dengan cek ContributorApplication / role CONTRIBUTOR. */
export function isApprovedContributor(user: ContributorRoleUser): boolean {
  return user?.role === "ADMIN";
}

export type ContributorCta = {
  href: string;
  label: string;
};

export function getContributorCta(user: ContributorRoleUser): ContributorCta {
  if (isApprovedContributor(user)) {
    return { href: "/submit-article", label: "Buat Artikel" };
  }
  return {
    href: CONTRIBUTOR_APPLY_PATH,
    label: "Daftar sebagai Kontributor",
  };
}
