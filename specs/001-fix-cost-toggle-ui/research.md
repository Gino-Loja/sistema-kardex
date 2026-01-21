# Research: Corregir Toggle de Actualización Automática de Costo Promedio

**Branch**: `001-fix-cost-toggle-ui`
**Date**: 2026-01-19

## Análisis del Problema

### Problema 1: Componente Switch incorrecto

**Hallazgo**: El componente `WarehouseCostModeToggle` define un Switch interno como checkbox HTML básico en lugar de usar el componente Switch de Radix UI existente.

**Código actual** (`src/components/warehouses/warehouse-cost-mode-toggle.tsx:7-19`):
```tsx
const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
  />
);
```

**Solución**: Importar y usar el componente `Switch` de `@/components/ui/switch` que ya implementa Radix UI con estilos consistentes.

---

### Problema 2: Nombre de campo incorrecto en API call

**Hallazgo**: El frontend envía `autoUpdateAverageCost` (camelCase) pero el schema de validación espera `auto_update_average_cost` (snake_case).

**Código actual** (`src/components/warehouses/warehouse-cost-mode-toggle.tsx:40`):
```tsx
body: JSON.stringify({ autoUpdateAverageCost: checked }),
```

**Schema de validación** (`src/lib/validations/masters.ts:59`):
```tsx
auto_update_average_cost: z.boolean().optional(),
```

**Solución**: Cambiar el nombre del campo en el body a `auto_update_average_cost`.

---

### Problema 3: Texto en inglés

**Hallazgo**: El label muestra "Automatic Average Cost Update" y "Updating..." en inglés.

**Solución**: Cambiar a "Actualización Automática de Costo Promedio" y "Actualizando...".

---

## Decisiones Técnicas

### D-001: Uso del componente Switch de Radix UI

**Decision**: Usar el componente `Switch` existente de `@/components/ui/switch`
**Rationale**:
- Ya existe y está configurado con los estilos del proyecto
- Proporciona accesibilidad (ARIA) out-of-the-box
- Consistencia visual con el resto de la aplicación
**Alternatives considered**:
- Crear un nuevo componente Switch → Rechazado: duplicación innecesaria
- Usar checkbox con estilos CSS → Rechazado: menor accesibilidad y experiencia

### D-002: Integración del Switch de Radix UI

**Decision**: Usar las props `checked` y `onCheckedChange` del Switch de Radix UI
**Rationale**:
- El componente Switch de Radix UI usa `checked` (boolean) y `onCheckedChange` (callback con boolean)
- Compatible directamente con el estado actual del componente
**Alternatives considered**:
- Usar `defaultChecked` para uncontrolled → Rechazado: necesitamos control del estado para revertir en errores

### D-003: Deshabilitar durante loading

**Decision**: Usar la prop `disabled` del Switch durante el estado de loading
**Rationale**:
- Previene múltiples clics durante la actualización
- El componente Switch ya soporta estado disabled con estilos visuales
**Alternatives considered**:
- Solo ignorar clics con early return → Rechazado: no da feedback visual al usuario

### D-004: Mantener estructura de archivos

**Decision**: Modificar únicamente `warehouse-cost-mode-toggle.tsx`
**Rationale**:
- El cambio es localizado
- No se necesitan nuevos archivos ni refactoring
**Alternatives considered**:
- Crear hook reutilizable → Rechazado: over-engineering para un solo uso

## Patrones de Código Identificados

### Patrón de Switch con Radix UI

El proyecto usa el siguiente patrón para switches:

```tsx
import { Switch } from "@/components/ui/switch"

<Switch
  checked={value}
  onCheckedChange={handleChange}
  disabled={isLoading}
/>
```

### Patrón de Labels con Switches

Basado en el componente existente y patrones de Radix UI:

```tsx
<div className="flex items-center space-x-2">
  <Switch id="switch-id" checked={value} onCheckedChange={handleChange} />
  <label htmlFor="switch-id" className="text-sm font-medium">
    {labelText}
  </label>
</div>
```

## Conclusión

No hay decisiones técnicas pendientes ("NEEDS CLARIFICATION"). Todos los aspectos del problema están claramente identificados y las soluciones son directas utilizando componentes y patrones existentes del proyecto.
