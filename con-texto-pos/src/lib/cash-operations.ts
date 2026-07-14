/* ============================================================
   OPERACIONES DE CAJA — Offline-First
   
   Funciones CRUD para gestionar sesiones de caja y
   búsqueda de productos por código de barras.
   
   Todos los datos se guardan primero en Dexie (BD local)
   y se sincronizan con Supabase cuando hay conexión.
   ============================================================ */

import { localDb, type CashSession, type CashSessionItem, type LocalProduct } from '@/core/db/dexie';
import { v4 as uuidv4 } from 'uuid';

/**
 * APERTURA DE CAJA
 * Crea una nueva sesión de caja con saldo inicial
 */
export async function openCashSession(initialBalance: number): Promise<CashSession> {
  const session: CashSession = {
    id: uuidv4(),
    opened_at: new Date().toISOString(),
    initial_balance: initialBalance,
    status: 'open',
    is_synced: false,
  };

  await localDb.cashSessions.add(session);
  return session;
}

/**
 * OBTENER SESIÓN ABIERTA
 * Devuelve la sesión de caja actualmente abierta (si existe)
 */
export async function getOpenCashSession(): Promise<CashSession | undefined> {
  return await localDb.cashSessions.where('status').equals('open').first();
}

/**
 * BUSCAR PRODUCTO POR CÓDIGO DE BARRAS
 * Busca en la BD local un producto por su código de barras
 * (Ideal para lectores de código de barras)
 */
export async function findProductByBarcode(barcode: string): Promise<LocalProduct | undefined> {
  return await localDb.products.where('barcode').equals(barcode).first();
}

/**
 * AGREGAR PRODUCTO A LA SESIÓN
 * Suma un producto (o aumenta cantidad) a la sesión abierta
 * Si ya existe el mismo producto, aumenta la cantidad
 */
export async function addProductToSession(
  sessionId: string,
  product: LocalProduct,
  quantity: number = 1
): Promise<CashSessionItem> {
  // Verificar si el producto ya existe en esta sesión
  const existingItem = await localDb.cashSessionItems
    .where('session_id')
    .equals(sessionId)
    .filter((item) => item.product_id === product.id)
    .first();

  if (existingItem) {
    // Actualizar cantidad
    const updatedItem: CashSessionItem = {
      ...existingItem,
      quantity: existingItem.quantity + quantity,
      total_price: (existingItem.quantity + quantity) * existingItem.unit_price,
    };
    await localDb.cashSessionItems.update(existingItem.id, updatedItem);
    return updatedItem;
  }

  // Crear nuevo item
  const newItem: CashSessionItem = {
    id: uuidv4(),
    session_id: sessionId,
    product_id: product.id,
    barcode: product.barcode,
    product_name: product.name,
    quantity,
    unit_price: product.price,
    total_price: quantity * product.price,
    added_at: new Date().toISOString(),
  };

  await localDb.cashSessionItems.add(newItem);
  return newItem;
}

/**
 * OBTENER ITEMS DE UNA SESIÓN
 * Devuelve todos los productos agregados a una sesión
 */
export async function getSessionItems(sessionId: string): Promise<CashSessionItem[]> {
  return await localDb.cashSessionItems.where('session_id').equals(sessionId).toArray();
}

/**
 * ELIMINAR ITEM DE LA SESIÓN
 * Remueve un producto de la sesión
 */
export async function removeItemFromSession(itemId: string): Promise<void> {
  await localDb.cashSessionItems.delete(itemId);
}

/**
 * ACTUALIZAR CANTIDAD DE UN ITEM
 * Modifica la cantidad de un producto en la sesión
 */
export async function updateItemQuantity(itemId: string, newQuantity: number): Promise<CashSessionItem> {
  const item = await localDb.cashSessionItems.get(itemId);

  if (!item) {
    throw new Error(`Item con ID ${itemId} no encontrado`);
  }

  const updatedItem: CashSessionItem = {
    ...item,
    quantity: newQuantity,
    total_price: newQuantity * item.unit_price,
  };

  await localDb.cashSessionItems.update(itemId, updatedItem);
  return updatedItem;
}

/**
 * CALCULAR TOTALES DE SESIÓN
 * Calcula el total de ventas, cantidad de items, etc.
 */
export async function calculateSessionTotals(sessionId: string) {
  const items = await getSessionItems(sessionId);

  const totals = {
    subtotal: items.reduce((sum, item) => sum + item.total_price, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    uniqueProducts: items.length,
  };

  return totals;
}

/**
 * CERRAR SESIÓN DE CAJA
 * Finaliza la sesión con saldo final y marca como sincronizable
 */
export async function closeCashSession(sessionId: string): Promise<CashSession> {
  const session = await localDb.cashSessions.get(sessionId);

  if (!session) {
    throw new Error(`Sesión con ID ${sessionId} no encontrada`);
  }

  if (session.status === 'closed') {
    throw new Error('La sesión ya fue cerrada');
  }

  const totals = await calculateSessionTotals(sessionId);

  const closedSession: CashSession = {
    ...session,
    closed_at: new Date().toISOString(),
    final_balance: session.initial_balance + totals.subtotal,
    status: 'closed',
    is_synced: false, // Marcar para sincronización
  };

  await localDb.cashSessions.update(sessionId, closedSession);
  return closedSession;
}

/**
 * LIMPIAR SESIÓN
 * Elimina todos los items de una sesión (útil si se cancela)
 */
export async function clearSessionItems(sessionId: string): Promise<void> {
  await localDb.cashSessionItems.where('session_id').equals(sessionId).delete();
}
