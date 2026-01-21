# Quickstart: Corregir Toggle de Actualización Automática de Costo Promedio

**Branch**: `001-fix-cost-toggle-ui`
**Date**: 2026-01-19

## Resumen del Cambio

Modificar el componente `WarehouseCostModeToggle` para:
1. Usar el componente Switch de Radix UI existente
2. Corregir el nombre del campo en la llamada API
3. Traducir textos al español

## Archivo a Modificar

**Único archivo**: `src/components/warehouses/warehouse-cost-mode-toggle.tsx`

## Cambios Requeridos

### 1. Importar el componente Switch correcto

```diff
- // TODO: Replace this with a real Switch component from a UI library like Shadcn/ui
- const Switch = ({
-   checked,
-   onChange,
- }: {
-   checked: boolean;
-   onChange: (checked: boolean) => void;
- }) => (
-   <input
-     type="checkbox"
-     checked={checked}
-     onChange={(e) => onChange(e.target.checked)}
-   />
- );
+ import { Switch } from "@/components/ui/switch";
```

### 2. Corregir nombre del campo en API call

```diff
- body: JSON.stringify({ autoUpdateAverageCost: checked }),
+ body: JSON.stringify({ auto_update_average_cost: checked }),
```

### 3. Traducir textos al español

```diff
- {isLoading
-   ? "Updating..."
-   : "Automatic Average Cost Update"}
+ {isLoading
+   ? "Actualizando..."
+   : "Actualización Automática de Costo Promedio"}
```

### 4. Actualizar uso del Switch con props correctas

```diff
- <Switch checked={isChecked} onChange={handleChange} />
+ <Switch
+   id="cost-mode-toggle"
+   checked={isChecked}
+   onCheckedChange={handleChange}
+   disabled={isLoading}
+ />
```

## Código Final Esperado

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export function WarehouseCostModeToggle({
  warehouseId,
  initialChecked,
}: {
  warehouseId: string;
  initialChecked: boolean;
}) {
  const [isChecked, setIsChecked] = useState(initialChecked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (checked: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bodegas/${warehouseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auto_update_average_cost: checked }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Error al actualizar la configuración"}`);
        setIsChecked(!checked);
      } else {
        setIsChecked(checked);
        router.refresh();
      }
    } catch (error) {
      alert("Ocurrió un error inesperado.");
      setIsChecked(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="cost-mode-toggle"
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={isLoading}
      />
      <label
        htmlFor="cost-mode-toggle"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {isLoading
          ? "Actualizando..."
          : "Actualización Automática de Costo Promedio"}
      </label>
    </div>
  );
}
```

## Verificación

1. Navegar a la página de detalle de una bodega
2. Verificar que el switch tiene el estilo visual de Radix UI
3. Hacer clic en el switch y verificar que:
   - El switch se deshabilita durante la actualización
   - Muestra "Actualizando..." durante el proceso
   - El cambio se guarda exitosamente (sin error NO_CHANGES)
   - La página se refresca después del éxito

## Dependencias

- Componente `Switch` de `@/components/ui/switch` (ya existe)
- API endpoint `PATCH /api/bodegas/{id}` (ya existe)
