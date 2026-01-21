import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";

export const getAuthSession = async () => {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
};

export const getAuthUser = async () => {
  const session = await getAuthSession();
  return session?.user ?? null;
};
