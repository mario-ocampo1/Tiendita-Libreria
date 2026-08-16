# DESIGN.md — Sistema de Diseño Con-Texto POS (Impeccable Standard)

## 1. Principios Visuales & Identidad
El sistema visual de **Con-Texto Chacras** combina la estética moderna de Material Design 3 (M3) con la identidad corporativa de Con-Texto Chacras.

- **Claridad de Mostrador**: Prioridad a la legibilidad inmediata de precios, montos de caja y acciones de cobro.
- **Jerarquía Rigurosa**: El elemento principal de la pantalla debe ser inconfundible. Evitar la competencia visual entre componentes.
- **Cero AI Slop**: Prohibidos los fondos beige genéricos, tarjetas anidadas sin propósito, bordes redondeados exagerados y faltas de contraste.

## 2. Paleta de Colores Corporativa
### Primario (Azul Marina)
- `blue-600` (`#1e3a52`): Headers, sidebars, elementos principales de marca.
- `blue-700` (`#1a2f42`): Botones primarios y estados hover.
- `blue-900` (`#081420`): Texto principal de alta legibilidad.
- `blue-50` (`#f0f4f8`): Fondos de tarjetas, hovers suaves y contenedores secundarios.
- `blue-200` (`#b3d1e0`): Divisores y bordes sutiles.

### Fondos y Superficies
- Fondo general: `#fffbfe` (blanco crema suave).
- Tarjetas y Contenedores: `#ffffff` con borde `blue-200` o elevación sutil.

### Estado Semántico
- **Éxito (Confirmación / Cobro)**: `#16a34a` (green-600) / Contenedor: `#d8f3dc`.
- **Alerta / Error**: `#dc2626` (red-600) / Contenedor: `#ffdad6`.
- **Advertencia**: `#eab308` (yellow-500).

## 3. Tipografía & Escalado (Roboto)
- **Familia tipográfica**: `Roboto` (`--font-roboto`, `system-ui`, `sans-serif`).
- **Números / Montos / SKU**: `Roboto Mono` (`--font-roboto-mono`, `monospace`).

### Escala Adaptativa (Fluid Sizing via `rem`)
- Base en monitores estándar: `16px` (`1rem`).
- Base en monitores Full HD (≥1440px): `17px` (`1.0625rem`).
- Base en pantallas Ultra (≥1920px): `18px` (`1.125rem`).

| Nivel | Tamaño REM | Uso |
|-------|------------|-----|
| Display Large | `3.5rem` | Totales gigantes de cobro en caja |
| Headline Large | `2rem` | Títulos de módulo principales |
| Title Large | `1.375rem` | Encabezados de tarjetas y secciones |
| Title Medium | `1.125rem` | Subtítulos y nombres de productos |
| Body Large | `1.125rem` | Texto de lectura principal |
| Body Medium | `1rem` | Filas de tabla, valores secundarios |
| Label Medium | `0.875rem` | Etiquetas de formulario y badges |

## 4. Estándares de Componentes
- **Botones Primarios**: Fondo `blue-600` (`#1e3a52`), texto blanco, `border-radius: 8px` (`0.5rem`), padding cómodo (`0.75rem 1.25rem`), hover a `blue-700`.
- **Botones de Cobro / Confirmación**: Fondo `green-600` (`#16a34a`), texto blanco, peso tipográfico `600`.
- **Campos de Entrada (Inputs)**: Fondo `#ffffff`, borde `1.5px solid #dde0f0`, foco con anillo `blue-600` (`2px`), padding `0.75rem 1rem`.
- **Tarjetas de Métricas**: Contenedores limpios con borde sutil, título secundario en gris y número principal destacado en `blue-900` o `green-600`.

## 5. Reglas Anti-Slop (Prohibiciones)
- ❌ **Prohibido**: Emplear colores verdes esmeralda (`emerald-*`) obsoletos.
- ❌ **Prohibido**: Utilizar tamaños de letra por debajo de `12px` (salvo micro-etiquetas excepcionales).
- ❌ **Prohibido**: Tarjetas dentro de tarjetas con el mismo color de fondo.
- ❌ **Prohibido**: Transiciones lentas (>300ms) que reduzcan la percepción de velocidad en caja.
