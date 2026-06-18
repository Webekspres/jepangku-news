import { Suspense } from "react";
import NewsletterUnsubscribePage from "./NewsletterUnsubscribeClient";

export const metadata = {
  title: "Berhenti berlangganan newsletter",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Memuat…
        </div>
      }
    >
      <NewsletterUnsubscribePage />
    </Suspense>
  );
}
