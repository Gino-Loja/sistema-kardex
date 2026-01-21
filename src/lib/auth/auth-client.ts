import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, adminRole, bodegueroRole } from "./permissions";

const DEFAULT_ROLE = "bodeguero";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */

  baseURL: "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        bodeguero: bodegueroRole,
      },
      defaultRole: DEFAULT_ROLE,
    }),
  ],
});
