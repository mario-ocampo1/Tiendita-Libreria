import Dexie, { type Table } from 'dexie';

// --- Tipos de Datos (Interfaces en Español) ---

export interface LocalProduct {
  id: string; // UUID (Coincide con Supabase)
  codigo_barras: string;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  updated_at: string;
  pending_sync?: boolean; // true = creado/editado offline, todavía no confirmado en Supabase
}

export interface PendingSale {
  local_id: string;
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

export interface CashSession {
  id: string;
  opened_at: string;
  closed_at?: string;
  initial_balance: number;
  final_balance?: number;
  status: 'open' | 'closed';
  is_synced: boolean;
}

export interface CashSessionItem {
  id: string;
  session_id: string;
  product_id: string;
  barcode: string;  // ← AGREGÁ ESTA LÍNEA
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  added_at: string;
}

// Cola genérica de operaciones pendientes de sincronizar contra Supabase.
// Se usa para productos por ahora; puede reutilizarse para otras entidades.
export interface SyncQueueItem {
  id: string; // uuid propio de la entrada de cola
  entity: 'productos'; // extender con más entidades si hace falta ('clientes', etc.)
  entity_id: string; // id del registro afectado (mismo id que en la tabla local)
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'failed';
  created_at: string;
  last_error?: string;
}

// --- Definición de la Base de Datos Local ---

export class PosDatabase extends Dexie {
  products!: Table<LocalProduct, string>;
  pendingSales!: Table<PendingSale, string>;
  cashSessions!: Table<CashSession, string>;
  cashSessionItems!: Table<CashSessionItem, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('ConTextoPosDB');

    this.version(2).stores({
      products: 'id, codigo_barras, nombre',
      pendingSales: 'local_id, status, created_at',
      cashSessions: 'id, status, opened_at',
      cashSessionItems: 'id, session_id, codigo_barras, added_at',
    });

    // Versión 3: agregamos la cola de sincronización genérica.
    // No hace falta migrar 'products' porque pending_sync es un campo opcional
    // y no se usa como índice (no rompe el store existente).
    this.version(3).stores({
      products: 'id, codigo_barras, nombre',
      pendingSales: 'local_id, status, created_at',
      cashSessions: 'id, status, opened_at',
      cashSessionItems: 'id, session_id, codigo_barras, added_at',
      syncQueue: 'id, entity, entity_id, status, created_at',
    });
  }
}

export const localDb = new PosDatabase();
