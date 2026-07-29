# Con-Texto POS

Sistema integral de gestión de punto de venta (POS) con dashboard analítico, autenticación segura y seguimiento de inventario.

## Descripción del Proyecto

**Con-Texto POS** es una aplicación web moderna para gestionar las operaciones de un negocio minorista:

- **Dashboard de ventas**: Visualiza en tiempo real el desempeño del día
- **Sistema de autenticación**: Acceso seguro con Supabase
- **Gestión de cobros**: Desglose por método de pago
- **Alertas inteligentes**: Notificaciones de stock bajo y productos por vencer
- **Interfaz moderna**: Diseño responsive con Tailwind CSS

---

## Cómo Empezar

### 1. Instalación

```bash
# Instala las dependencias
npm install
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 3. Flujo de Uso

1. **Acceso**: Dirígete a `/auth/login` para ingresar
2. **Dashboard**: Una vez autenticado, verás automáticamente el dashboard principal
3. **Navegación**: Usa el menú lateral para acceder a diferentes secciones

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Página de entrada (redirige a login o dashboard)
│   │
│   ├── auth/                     # Sistema de autenticación
│   │   ├── login/                # Página de login
│   │   ├── callback/             # Callback de OAuth
│   │   └── set-password/         # Establecer contraseña
│   │
│   └── dashboard/                # Dashboard principal (protegido)
│       ├── layout.tsx            # Layout del dashboard con navbar y sidebar
│       ├── page.tsx              # Página principal
│       │
│       ├── caja/                 # Módulo de caja/cobros
│       │   ├── page.tsx
│       │   └── components/
│       │
│       └── components/           # Componentes del dashboard
│           ├── DailySummary.tsx      # Resumen diario (ventas, tickets, ganancias)
│           ├── PaymentMethods.tsx    # Cobros por método de pago
│           ├── AttentionRequired.tsx # Alertas (stock bajo, vencimientos)
│           ├── QuickAccess.tsx       # Accesos rápidos
│           └── UserMenu.tsx          # Menú del usuario
│
├── core/
│   ├── db/
│   │   └── dexie.ts              # Base de datos local (indexedDB)
│   └── supabase/
│       ├── client.ts             # Cliente de Supabase (lado cliente)
│       └── server.ts             # Cliente de Supabase (lado servidor)
│
└── lib/
    ├── cash-utils.ts             # Utilitarios de caja
    ├── dashboard-utils.ts        # Tipos y formateadores del dashboard
    ├── supabase-cash-queries.ts   # Queries de caja
    └── supabase-queries.ts       # Queries generales de Supabase
```

---

## Características Principales

### Dashboard Interactivo
- **Resumen Diario**: Venta total, ventas confirmadas, ticket promedio, ganancia estimada
- **Métodos de Pago**: Desglose de ingresos por tipo de pago (efectivo, tarjeta, etc.)
- **Alertas Críticas**: Monitoreo de productos próximos a vencer y stock bajo
- **Accesos Rápidos**: Navegación directa a módulos principales

### Seguridad
- Autenticación con Supabase
- Rutas protegidas (solo usuarios autenticados)
- Sesiones seguras
- Logout disponible en menú

### Interfaz Intuitiva
- Diseño **mobile-first** y responsive
- Colores corporativos: Verde esmeralda + Gris claro
- Navegación clara con sidebar y navbar
- Componentes reutilizables

---

## Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Lenguaje**: TypeScript (estricto)
- **Estilos**: Tailwind CSS
- **Iconos**: Heroicons
- **Base de Datos**: Supabase
- **Almacenamiento Local**: Dexie (IndexedDB)
- **Autenticación**: Supabase Auth

---

## Configuración Necesaria

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

---

## Próximos Pasos

### Datos Reales
- [ ] Conectar con base de datos de ventas real
- [ ] Implementar queries en `supabase-queries.ts`
- [ ] Agregar cálculos de estadísticas en tiempo real

### Nuevas Secciones
- [ ] `/dashboard/ventas` - Listado completo de ventas
- [ ] `/dashboard/cuentas` - Cuentas por cobrar
- [ ] `/dashboard/productos` - Gestión de inventario
- [ ] `/dashboard/reportes` - Reportes exportables

### Mejoras
- [ ] Gráficos de ventas (Charts.js / Recharts)
- [ ] Filtros avanzados por fecha y categoría
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Notificaciones en tiempo real

---

## Estándares de Código

Este proyecto sigue estándares estrictos de calidad:

✅ **Clean Code**: Funciones pequeñas con responsabilidad única  
✅ **Comentarios en Español**: Toda documentación en español  
✅ **TypeScript Estricto**: Sin uso de `any`  
✅ **Máximo 200 líneas por archivo**: Archivos modularizados  
✅ **Naming Conventions**: `camelCase` (vars), `PascalCase` (componentes)  

Consulta [AGENTS.md](./AGENTS.md) para más detalles.

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Linting y formato
npm run lint
```

---

## Soporte

Para contribuir o reportar problemas, revisa la documentación en:
- [AGENTS.md](./AGENTS.md) - Estándares de código y reglas del proyecto
- [DASHBOARD_README.md](./DASHBOARD_README.md) - Detalles de la implementación del dashboard
