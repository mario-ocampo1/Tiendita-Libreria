<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:con-texto-pos-code-standards -->
# Estándares de Código — con-texto-pos

Estas reglas son **OBLIGATORIAS** para todo el código generado en este proyecto. Sin excepción.

## 1. Clean Code
- Funciones pequeñas con una única responsabilidad (Principio de Responsabilidad Única).
- Ningún archivo debe superar las 200 líneas de código. Si lo hace, dividirlo en módulos.
- Evitar anidamiento profundo (máximo 2 niveles). Usar early returns.
- Cero código muerto ni variables sin usar.

## 2. Comentarios en Español
- Todos los comentarios del código deben estar escritos en **español**.
- Comentar únicamente lógica de negocio compleja o decisiones no evidentes.
- No comentar lo obvio (ej: no poner `// suma los valores` sobre `a + b`).

## 3. Nomenclatura
- Variables y funciones: `camelCase` descriptivo (en español o inglés según el contexto del archivo existente).
- Componentes React: `PascalCase`.
- Tipos e interfaces TypeScript: `PascalCase`, sin prefijo `I`.
- Constantes globales: `UPPER_SNAKE_CASE`.

## 4. TypeScript Estricto
- Prohibido el uso de `any`. Definir siempre tipos e interfaces claras.
- Usar `interface` para objetos de datos y `type` para uniones o aliases.

## 5. Fácil Mantenimiento
- Extraer valores mágicos a constantes nombradas.
- La lógica de negocio va en hooks o servicios, nunca directamente en componentes de UI.
- Preferir composición sobre herencia.

## 6. Gestor de Paquetes
- El proyecto utiliza **pnpm** como gestor de paquetes exclusivo.
- Usar siempre `pnpm install`, `pnpm run dev`, `pnpm add <pkg>`, etc. Prohibido usar `npm` o `yarn`.
<!-- END:con-texto-pos-code-standards -->
