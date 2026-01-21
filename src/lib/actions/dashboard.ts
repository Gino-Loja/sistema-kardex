"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/guards";
import { getDashboardSummary } from "@/lib/queries/dashboard";

export const fetchDashboardSummary = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  requirePermission(
    user
      ? {
          user: {
            id: user.id,
            role: user.role ?? null,
            email: user.email ?? null,
          },
        }
      : null,
    "dashboard:read",
  );

  return getDashboardSummary();
};
