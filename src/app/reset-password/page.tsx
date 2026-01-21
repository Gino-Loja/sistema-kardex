import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { PasswordResetForm } from "@/components/auth/password-reset-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import {
  DEFAULT_AUTHENTICATED_REDIRECT,
  NEXT_COOKIE_NAME,
  NEXT_QUERY_PARAM,
  resolveNextPath,
} from "@/lib/auth/redirects";
import { createLoader, parseAsString, type SearchParams } from "nuqs/server";

type ResetPasswordPageProps = {
  searchParams: Promise<SearchParams>;
};

const resetSearchParams = {
  [NEXT_QUERY_PARAM]: parseAsString,
  token: parseAsString,
  error: parseAsString,
} as const;

const loadSearchParams = createLoader(resetSearchParams);

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await loadSearchParams(searchParams);
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  const nextFromQuery = resolveNextPath(
    resolvedSearchParams[NEXT_QUERY_PARAM],
  );
  const cookieStore = await cookies();
  const nextFromCookie = resolveNextPath(
    cookieStore.get(NEXT_COOKIE_NAME)?.value,
  );
  const nextPath =
    nextFromQuery ?? nextFromCookie ?? DEFAULT_AUTHENTICATED_REDIRECT;

  if (session?.user) {
    redirect(nextPath);
  }

  const token = resolvedSearchParams.token;
  const error = resolvedSearchParams.error;

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Restablecer contrasena</CardTitle>
            <CardDescription>
              Solicita un enlace o confirma el cambio con tu token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordResetForm token={token} error={error} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
