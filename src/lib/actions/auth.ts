"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const okMessage =
  "Si el correo existe en el sistema, enviaremos un enlace de restablecimiento.";

export const requestPasswordResetAction = async (
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const headersList = await headers();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "El correo es obligatorio." };
  }

  try {
    await auth.api.requestPasswordReset({
      headers: headersList,
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });

    return { status: "success", message: okMessage };
  } catch (error) {
    return {
      status: "error",
      message: "No se pudo enviar el enlace. Intenta nuevamente.",
    };
  }
};

export const resetPasswordAction = async (
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const headersList = await headers();
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { status: "error", message: "El token es obligatorio." };
  }

  if (!newPassword || !confirmPassword) {
    return { status: "error", message: "Completa la nueva contrasena." };
  }

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "Las contrasenas no coinciden." };
  }

  try {
    await auth.api.resetPassword({
      headers: headersList,
      body: {
        token,
        newPassword,
      },
    });

    return {
      status: "success",
      message: "Contrasena actualizada. Ya puedes iniciar sesion.",
    };
  } catch (error) {
    return {
      status: "error",
      message: "No se pudo actualizar la contrasena. Intenta nuevamente.",
    };
  }
};
