export const NEXT_QUERY_PARAM = "next";
export const NEXT_COOKIE_NAME = "kardex_next";
export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard";

export const resolveNextPath = (
  candidate: string | null | undefined,
): string | null => {
  if (!candidate) {
    return null;
  }

  if (!candidate.startsWith("/")) {
    return null;
  }

  if (candidate.startsWith("//")) {
    return null;
  }

  if (candidate.startsWith("/api/auth")) {
    return null;
  }

  return candidate;
};
