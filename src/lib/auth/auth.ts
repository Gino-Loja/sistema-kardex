import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../drizzle/db";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { ac, adminRole, bodegueroRole } from "./permissions";

const DEFAULT_ROLE = "bodeguero";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("@/lib/actions/email");
      const { renderResetPasswordEmail } = await import(
        "@/email-template/reset-password"
      );

      const html = await renderResetPasswordEmail({
        name: user.name || "usuario",
        url,
      });

      await sendEmail({
        to: user.email,
        subject: "Restablecer contrasena",
        html,
        text: `Hola ${user.name || "usuario"},\n\nPara restablecer tu contrasena visita: ${url}\n\nSi no solicitaste este cambio, puedes ignorar este mensaje.`,
      });
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  plugins: [
    nextCookies(),
    admin({
      ac,
      roles: {
        admin: adminRole,
        bodeguero: bodegueroRole,
      },
      defaultRole: DEFAULT_ROLE,
    }), // make sure this is the last plugin in the array
  ],
});
