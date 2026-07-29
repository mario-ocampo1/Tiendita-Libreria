# Paleta de Colores - Con-Texto POS

Esta es la guía oficial de colores del proyecto. Todos los componentes y elementos visuales deben usar esta paleta.

## Colores Corporativos

### Color Primario: Azul Marina
**Descripción**: Color principal de la marca, extraído del logo oficial.

| Nivel | HEX | RGB | Tailwind | Uso |
|-------|-----|-----|----------|-----|
| 50 | `#f0f4f8` | rgb(240, 244, 248) | `blue-50` | Fondos suaves, hover states |
| 100 | `#d9e8f0` | rgb(217, 232, 240) | `blue-100` | Backgrounds claros |
| 200 | `#b3d1e0` | rgb(179, 209, 224) | `blue-200` | Borders, dividers |
| 300 | `#8cbad0` | rgb(140, 186, 208) | `blue-300` | Elementos interactivos |
| 400 | `#6a9db4` | rgb(106, 157, 180) | `blue-400` | Hovers |
| 500 | `#4a7fa0` | rgb(74, 127, 160) | `blue-500` | Texto de importancia media |
| 600 | `#1e3a52` | rgb(30, 58, 82) | `blue-600` | **[PRIMARIO] Sidebars, navbars** |
| 700 | `#1a2f42` | rgb(26, 47, 66) | `blue-700` | Buttons, highlights |
| 800 | `#0f1f2e` | rgb(15, 31, 46) | `blue-800` | Dark mode backgrounds |
| 900 | `#081420` | rgb(8, 20, 32) | `blue-900` | **[OSCURO] Textos sobre blanco** |

**Tailwind CSS**: Usa `blue-600` para el color primario

### Color Secundario: Blanco/Crema
**Descripción**: Color de fondo y neutrales principales.

| Valor | HEX | RGB | Tailwind | Uso |
|-------|-----|-----|----------|-----|
| Blanco puro | `#ffffff` | rgb(255, 255, 255) | `white` | Componentes principales |
| Crema suave | `#fafbfc` | rgb(250, 251, 252) | `gray-50` | Backgrounds suaves |
| Gris claro | `#f3f4f6` | rgb(243, 244, 246) | `gray-100` | Secondary backgrounds |

---

## Colores de Soporte

### Verde (Éxito / Información Positiva)
```
- Verde 600: #16a34a (Tailwind: green-600)
- Uso: Botones de confirmación, estados positivos
```

### Rojo (Advertencia / Error)
```
- Rojo 600: #dc2626 (Tailwind: red-600)
- Uso: Errores, alertas críticas, botones destructivos
```

### Amarillo (Atención)
```
- Amarillo 500: #eab308 (Tailwind: yellow-500)
- Uso: Advertencias, información moderada
```

---

## Ejemplos de Uso

### Navbar y Sidebar
```tsx
{/* Usar blue-600 como color principal */}
<nav className="bg-blue-600 text-white">
  {/* Contenido */}
</nav>

<aside className="bg-blue-600 text-white">
  {/* Contenido */}
</aside>
```

### Botones Primarios
```tsx
{/* Azul oscuro */}
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Acción
</button>
```

### Cards y Componentes
```tsx
{/* Fondo blanco con border azul suave */}
<div className="bg-white border border-blue-200 rounded-2xl p-6">
  {/* Contenido */}
</div>
```

### Accents y Highlights
```tsx
{/* Para números importantes, precios, etc. */}
<p className="text-blue-600 font-semibold">$1,250.00</p>
```

### Estados de Hover
```tsx
<a href="#" className="text-blue-600 hover:text-blue-700">
  Enlace
</a>

<button className="bg-blue-50 hover:bg-blue-100 text-blue-600">
  Botón secundario
</button>
```

---

## Restricciones de Color

❌ **NO USAR**:
- `emerald-*` (verde esmeralda - OBSOLETO)
- `gray-900` para fondos principales
- Colores sin contraste suficiente
- Múltiples colores primarios en la misma página

✅ **HACER SIEMPRE**:
- Usar `blue-600` como primario
- Mantener suficiente contraste (WCAG AA mínimo)
- Ser consistente con la paleta definida
- Revisar el componente en diferentes resoluciones

---

## Actualización de Componentes

Cuando actualices componentes de azul (`emerald-*`) a azul marina (`blue-*`):

```diff
- className="bg-emerald-900"
+ className="bg-blue-600"

- className="bg-emerald-700 hover:bg-emerald-600"
+ className="bg-blue-700 hover:bg-blue-600"

- className="text-emerald-600"
+ className="text-blue-600"
```

---

## Referencia de Componentes

| Componente | Color Recomendado | Tailwind |
|------------|------------------|----------|
| Navbar | Azul Marina | `bg-blue-600` |
| Sidebar | Azul Marina | `bg-blue-600` |
| Buttons Primarios | Azul Marina | `bg-blue-600 hover:bg-blue-700` |
| Buttons Secundarios | Azul Claro | `bg-blue-50 text-blue-600` |
| Cards | Blanco | `bg-white` |
| Backgrounds | Crema | `bg-gray-50` |
| Borders | Azul 200 | `border-blue-200` |
| Texto Normal | Azul 900 | `text-blue-900` |
| Texto Secundario | Gris 600 | `text-gray-600` |

---

**Última actualización**: 2026-07-13  
**Versión**: 1.0  
**Logo de referencia**: `/public/Logo.jpeg`
