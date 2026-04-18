type SignInPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const params = await searchParams;
  const hasOAuthError = params?.error === "oauth_failed";
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Continue with your Google account to access your dashboard.
          </p>

          {hasOAuthError ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Google sign-in failed. Please try again.
            </p>
          ) : null}

          <a
            href={`${serverUrl}/api/auth/google`}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            <span>Continue with Google</span>
          </a>
        </div>
      </section>
    </main>
  );
};

export default SignInPage;