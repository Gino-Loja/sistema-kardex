"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  nextPath: string;
};

export const LoginForm = ({ nextPath }: LoginFormProps) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Correo y contrasena son obligatorios.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await authClient.signIn.email({
          email,
          password,
        });

        if (response.error) {
          setError(response.error.message ?? "Credenciales invalidas.");
          return;
        }

        window.location.href = nextPath;
      } catch (err) {
        setError("No se pudo iniciar sesion. Intenta nuevamente.");
      }
    });
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="login-email">Correo</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Contrasena</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        <Link className="text-primary hover:underline" href="/reset-password">
          Olvidaste tu contrasena?
        </Link>
      </p>
    </form>
  );
};
