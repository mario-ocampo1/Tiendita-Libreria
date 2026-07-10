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

// --- Definición de la Base de Datos Local ---

export class PosDatabase extends Dexie {
  products!: Table<LocalProduct, string>;
  pendingSales!: Table<PendingSale, string>;

  constructor() {
    super('ConTextoPosDB');
    
    // Esquema V1 e Índices (sólo indexar campos necesarios para búsqueda)
    this.version(1).stores({
      products: 'id, barcode, name', // Permite búsquedas veloces del lector de código de barras
      pendingSales: 'local_id, status, created_at' // Índices para el proceso de sincronización
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
