# Módulo de Caja — Offline-First

## Arquitectura

El módulo de caja funciona con una arquitectura **offline-first** usando:

- **Dexie** (IndexedDB) - Base de datos local
- **Supabase** - Sincronización en la nube
- **React Hooks** - Gestión de estado en componentes

## Estructura de Datos

### CashSession
```typescript
{
  id: string;              // UUID
  opened_at: string;       // ISO 8601
  closed_at?: string;      // ISO 8601 (null si está abierta)
  initial_balance: number; // Saldo inicial
  final_balance?: number;  // Saldo final (calculado al cerrar)
  status: 'open' | 'closed';
  is_synced: boolean;      // Marca para sincronización
}
```

### CashSessionItem
```typescript
{
  id: string;           // UUID
  session_id: string;   // FK a CashSession
  product_id: string;   // FK a LocalProduct
  barcode: string;      // Código de barras
  product_name: string; // Nombre (desnormalizado)
  quantity: number;     // Cantidad vendida
  unit_price: number;   // Precio unitario
  total_price: number;  // quantity * unit_price
  added_at: string;     // ISO 8601
}
```

## Uso en Componentes

### 1. Iniciar Sesión de Caja

```tsx
'use client';

import { useCashSession } from '@/lib/hooks/useCashSession';

export default function CashRegister() {
  const { session, initSession } = useCashSession();

  const handleOpenCash = async () => {
    await initSession(100); // Saldo inicial de $100
  };

  if (!session) {
    return <button onClick={handleOpenCash}>Abrir Caja</button>;
  }

  return <div>Caja abierta</div>;
}
```

### 2. Buscar Producto por Código de Barras

```tsx
const { searchProductByBarcode, addProduct } = useCashSession();

async function handleBarcodeScanned(barcode: string) {
  const product = await searchProductByBarcode(barcode);
  
  if (product) {
    await addProduct(product, 1); // Agregar 1 unidad
  } else {
    console.log('Producto no encontrado');
  }
}
```

### 3. Mostrar Items de la Sesión

```tsx
const { items, totals } = useCashSession();

return (
  <div>
    <h2>Artículos ({totals?.uniqueProducts})</h2>
    {items.map((item) => (
      <div key={item.id}>
        <p>{item.product_name} x{item.quantity}</p>
        <p>${item.total_price.toFixed(2)}</p>
      </div>
    ))}
    <h3>Total: ${totals?.subtotal.toFixed(2)}</h3>
  </div>
);
```

### 4. Modificar Cantidad

```tsx
const { updateQuantity } = useCashSession();

async function handleQuantityChange(itemId: string, newQuantity: number) {
  await updateQuantity(itemId, newQuantity);
}
```

### 5. Remover Producto

```tsx
const { removeItem } = useCashSession();

async function handleRemoveItem(itemId: string) {
  await removeItem(itemId);
}
```

### 6. Cerrar Sesión

```tsx
const { closeSession } = useCashSession();

async function handleCloseCash() {
  await closeSession();
  // La sesión está cerrada, los datos listos para sincronizar
}
```

## Flujo Completo

```typescript
// 1. Abrir caja
const { session, items, totals, addProduct, removeItem, closeSession } = useCashSession();
await initSession(100);

// 2. Agregar productos (via código de barras)
const product = await searchProductByBarcode('123456');
await addProduct(product, 1);

// 3. Ver totales
console.log(totals); // { subtotal: 50.00, itemCount: 1, uniqueProducts: 1 }

// 4. Modificar items
await updateQuantity(itemId, 2);
await removeItem(itemId);

// 5. Cerrar sesión
await closeSession();
// Ahora la sesión está lista para sincronizar con Supabase
```

## Sincronización (Próximas fases)

1. **Detectar conexión**: Escuchar evento `online`
2. **Buscar pendientes**: Consultar `CashSession` con `is_synced = false`
3. **Enviar a Supabase**: Usar RPC o REST API
4. **Actualizar estado**: Marcar como sincronizado

## Archivos Relacionados

- `/src/core/db/dexie.ts` - Definición de base de datos
- `/src/lib/cash-operations.ts` - Funciones CRUD
- `/src/lib/hooks/useCashSession.ts` - Hook React
- `/src/app/dashboard/caja/components/` - Componentes de UI
