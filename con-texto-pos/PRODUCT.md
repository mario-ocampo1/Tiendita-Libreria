# PRODUCT.md — Con-Texto Chacras POS

## 1. Visión del Producto
**Con-Texto Chacras POS** es el sistema de Punto de Venta y Gestión Comercial diseñado específicamente para la librería y local comercial *Con-Texto Chacras* (Chacras de Coria, Mendoza). Permite registrar ventas ágiles, gestionar la caja física en tiempo real, monitorear métricas del negocio y operar sin interrupciones gracias a su arquitectura offline-first con sincronización automática en la nube.

## 2. Usuarios Principales
- **Cajeros / Vendedores**: Operan el punto de venta diario. Requieren carga ultrarrápida de productos, búsqueda por código de barras o nombre, selección de medio de pago (Efectivo, Mercado Pago, Transferencia, Tarjeta) e impresión de tickets sin demoras.
- **Encargado de Caja / Negocio**: Realiza aperturas y cierres de sesión de caja, arqueos, ingresos/egresos de efectivo y control de desviaciones.
- **Administrador / Dueño**: Monitorea métricas consolidadas (ventas diarias/mensuales, ticket promedio, productos más vendidos, stock bajo) y gestiona el catálogo de productos.

## 3. Módulos y Flujos Clave
- **Autenticación (`/auth/login`, `/auth/set-password`)**: Inicio de sesión seguro por Supabase Auth.
- **Resumen Comercial (`/dashboard`)**: Panel principal con KPIs en tiempo real (ventas del día, estado de caja, alertas de stock bajo y acciones rápidas).
- **Gestión de Caja y Ventas (`/dashboard/caja`)**:
  - Apertura de caja con monto inicial.
  - Venta de mostrador (búsqueda de producto, cantidad, descuentos, selección de pago).
  - Movimientos de caja (ingresos y retiros de efectivo).
  - Cierre de caja con resumen de arqueo e impresión de ticket.
- **Catálogo de Productos (`/dashboard/productos`)**: Gestión de stock, precios, categorías y sincronización IndexedDB ↔ Supabase.
- **Métricas y Analítica (`/dashboard/metricas`)**: Gráficos de tendencias, métodos de pago más usados e historial de operaciones.

## 4. Requisitos Operativos No Funcionales
- **Resiliencia Offline**: Operación continua si falla la conexión a internet mediante Dexie.js (IndexedDB local), con resincronización automática a Supabase al reconectar.
- **Velocidad UX**: Tiempos de respuesta de búsqueda <100ms y procesamiento de cobro en <2 segundos.
- **Legibilidad Visual**: Tipografía Roboto optimizada con escalado dinámico para fácil lectura a distancia de mostrador.
