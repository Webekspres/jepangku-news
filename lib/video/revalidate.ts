import { revalidatePath } from "next/cache";

/** Invalidate homepage TV data after admin video mutations. */
export function revalidateHomeTv(): void {
  revalidatePath("/");
  revalidatePath("/tv");
  revalidatePath("/api/home/tv");
  revalidatePath("/explore");
}
