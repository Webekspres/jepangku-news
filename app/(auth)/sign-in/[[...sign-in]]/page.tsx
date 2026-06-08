import { SignIn } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';

export default function SignInPage() {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white"
      data-testid="sign-in-page"
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        appearance={clerkAppearance}
      />
    </div>
  );
}
