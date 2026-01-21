export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-md rounded-xl border bg-card px-6 py-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Acceso denegado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No tienes permisos para ver esta seccion. Contacta al administrador si
          necesitas acceso.
        </p>
      </div>
    </div>
  );
}
