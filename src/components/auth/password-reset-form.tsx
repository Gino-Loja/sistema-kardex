"use client";

import { useActionState } from "react";

import {
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthActionState,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { status: "idle" };

type PasswordResetFormProps = {
  token?: string | null;
  error?: string | null;
};

export const PasswordResetForm = ({
  token,
  error,
}: PasswordResetFormProps) => {
  const [requestState, requestAction, requestPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  if (token) {
    return (
      <form action={resetAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <Label htmlFor="reset-password">Nueva contrasena</Label>
          <Input
            id="reset-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-password-confirm">Confirmar contrasena</Label>
          <Input
            id="reset-password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {resetState.message ? (
          <p
            className={
              resetState.status === "success"
                ? "text-sm text-emerald-600"
                : "text-sm text-destructive"
            }
          >
            {resetState.message}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={resetPending}>
          {resetPending ? "Actualizando..." : "Actualizar contrasena"}
        </Button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Correo</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
        />
      </div>
      {requestState.message ? (
        <p
          className={
            requestState.status === "success"
              ? "text-sm text-emerald-600"
              : "text-sm text-destructive"
          }
        >
          {requestState.message}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={requestPending}>
        {requestPending ? "Enviando..." : "Enviar enlace"}
      </Button>
    </form>
  );
};
