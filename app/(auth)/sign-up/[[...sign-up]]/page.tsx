import { SignUp } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';

export default function SignUpPage() {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white"
      data-testid="sign-up-page"
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={clerkAppearance}
      />
    </div>
  );
}
