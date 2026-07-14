import Dexie, { type Table } from 'dexie';

// --- Tipos de Datos (Interfaces) ---

export interface LocalProduct {
  id: string; // UUID (Coincide con Supabase)
  barcode: string;
  name: string;
  price: number;
  stock: number;
  updated_at: string;
}

export interface PendingSale {
  local_id: string; // ID autogenerado en el cliente (UUID) para trazar la venta
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  total: number;
  payment_method: 'cash' | 'card' | 'mercado_pago';
  status: 'pending' | 'syncing' | 'failed'; 
  created_at: string;
}

// Sesión de Caja - Para transacciones offline-first
export interface CashSession {
  id: string; // UUID
  opened_at: string; // ISO 8601
  closed_at?: string; // ISO 8601 (null si está abierta)
  initial_balance: number; // Saldo inicial
  final_balance?: number; // Saldo final (calculado al cerrar)
  status: 'open' | 'closed'; // Estado de la sesión
  is_synced: boolean; // ¿Se sincronizó con Supabase?
}

// Items dentro de una sesión de caja
export interface CashSessionItem {
  id: string; // UUID
  session_id: string; // FK a CashSession
  product_id: string; // FK a LocalProduct
  barcode: string; // Código de barras del producto
  product_name: string; // Nombre del producto (desnormalizado para offline)
  quantity: number; // Cantidad vendida
  unit_price: number; // Precio unitario
  total_price: number; // quantity * unit_price
  added_at: string; // ISO 8601 - Cuándo se agregó a la sesión
}

// --- Definición de la Base de Datos Local ---

export class PosDatabase extends Dexie {
  products!: Table<LocalProduct, string>;
  pendingSales!: Table<PendingSale, string>;
  cashSessions!: Table<CashSession, string>;
  cashSessionItems!: Table<CashSessionItem, string>;

  constructor() {
    super('ConTextoPosDB');
    
    // Esquema V1 e Índices (sólo indexar campos necesarios para búsqueda)
    this.version(1).stores({
      products: 'id, barcode, name', // Permite búsquedas veloces del lector de código de barras
      pendingSales: 'local_id, status, created_at', // Índices para el proceso de sincronización
      cashSessions: 'id, status, opened_at', // Sesiones de caja por estado y fecha
      cashSessionItems: 'id, session_id, barcode, added_at', // Items por sesión y código de barras
    });
  }
}

export const localDb = new PosDatabase();

/**
 * --- COLA DE SINCRONIZACIÓN (DEXIE <-> SUPABASE) ---
 * 
 * 1. MODO OFFLINE (Venta Activa): 
 *    Cuando no hay red o está inestable, la venta se inserta en `pendingSales` 
 *    con status = 'pending'. Localmente, el stock de `products` se deduce de forma optimista.
 * 
 * 2. DISPARADOR DE SINCRONIZACIÓN: 
 *    Un hook global (ej. escuchando `window.addEventListener('online')`) y un bucle de fondo 
 *    (setInterval/Web Worker) consultarán `pendingSales` buscando registros en 'pending'.
 * 
 * 3. PROCESAMIENTO A NUBE:
 *    Se agrupan las ventas pendientes y se hace un envío vía RPC o Supabase Client.
 *    - ÉXITO: El registro en `pendingSales` se elimina.
 *    - FALLO DE RED: Retorna a 'pending' y se reintenta luego.
 *    - FALLO LÓGICO (ej. stock negativo real): Pasa a 'failed' para revisión manual.
 */
