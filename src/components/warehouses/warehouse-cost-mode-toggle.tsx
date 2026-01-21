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
    } catch {
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
