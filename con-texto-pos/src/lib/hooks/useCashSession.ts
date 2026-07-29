'use client';

/* ============================================================
   HOOK: useCashSession
   
   Maneja el estado de una sesión de caja y proporciona
   métodos para agregar/remover productos.
   
   Uso en componentes:
   const { session, items, addProduct, removeItem, totals } = useCashSession();
   ============================================================ */

import { useEffect, useState, useCallback } from 'react';
import type { CashSession, CashSessionItem, LocalProduct } from '@/core/db/dexie';
import {
  getOpenCashSession,
  openCashSession,
  findProductByBarcode,
  addProductToSession,
  getSessionItems,
  removeItemFromSession,
  updateItemQuantity,
  calculateSessionTotals,
  closeCashSession,
  clearSessionItems,
} from '@/lib/cash-operations';

interface SessionTotals {
  subtotal: number;
  itemCount: number;
  uniqueProducts: number;
}

interface UseCashSessionReturn {
  // Estado
  session: CashSession | null;
  items: CashSessionItem[];
  totals: SessionTotals | null;
  isLoading: boolean;
  error: string | null;

  // Operaciones
  initSession: (initialBalance: number) => Promise<void>;
  searchProductByBarcode: (barcode: string) => Promise<LocalProduct | undefined>;
  addProduct: (product: LocalProduct, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  closeSession: () => Promise<void>;
  clearItems: () => Promise<void>;
}

export function useCashSession(): UseCashSessionReturn {
  // --- ESTADO ---
  const [session, setSession] = useState<CashSession | null>(null);
  const [items, setItems] = useState<CashSessionItem[]>([]);
  const [totals, setTotals] = useState<SessionTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CARGAR SESIÓN AL MONTAR ---
  useEffect(() => {
    loadSession();
  }, []);

  // --- REFRESCAR TOTALES CUANDO CAMBIAN LOS ITEMS ---
  useEffect(() => {
    if (session) {
      recalculateTotals();
    }
  }, [items, session]);

  // --- FUNCIONES INTERNAS ---

  async function loadSession() {
    try {
      setIsLoading(true);
      setError(null);

      const openSession = await getOpenCashSession();
      setSession(openSession || null);

      if (openSession) {
        const sessionItems = await getSessionItems(openSession.id);
        setItems(sessionItems);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  async function recalculateTotals() {
    if (!session) return;

    try {
      const newTotals = await calculateSessionTotals(session.id);
      setTotals(newTotals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular totales');
    }
  }

  // --- OPERACIONES PÚBLICAS ---

  const initSession = useCallback(async (initialBalance: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const newSession = await openCashSession(initialBalance);
      setSession(newSession);
      setItems([]);
      setTotals({ subtotal: 0, itemCount: 0, uniqueProducts: 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al abrir sesión';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProductByBarcode = useCallback(
    async (barcode: string): Promise<LocalProduct | undefined> => {
      try {
        setError(null);
        const product = await findProductByBarcode(barcode);
        return product;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al buscar producto';
        setError(message);
        return undefined;
      }
    },
    []
  );

  const addProduct = useCallback(
    async (product: LocalProduct, quantity: number = 1) => {
      if (!session) {
        setError('No hay sesión abierta');
        return;
      }

      try {
        setError(null);
        await addProductToSession(session.id, product, quantity);
        const updatedItems = await getSessionItems(session.id);
        setItems(updatedItems);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al agregar producto';
        setError(message);
        throw err;
      }
    },
    [session]
  );

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      await removeItemFromSession(itemId);
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al remover item';
      setError(message);
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setError(null);

      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await updateItemQuantity(itemId, quantity);
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            // Acá estaba el error, cambiado de unit_price a precio_unitario
            ? { ...item, quantity, total_price: quantity * item.precio_unitario }
            : item
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar cantidad';
      setError(message);
      throw err;
    }
  }, [removeItem]);

  const closeSession = useCallback(async () => {
    if (!session) {
      setError('No hay sesión abierta');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const closedSession = await closeCashSession(session.id);
      setSession(closedSession);
      // Los items se mantienen en la sesión cerrada
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const clearItems = useCallback(async () => {
    if (!session) {
      setError('No hay sesión abierta');
      return;
    }

    try {
      setError(null);
      await clearSessionItems(session.id);
      setItems([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al limpiar items';
      setError(message);
      throw err;
    }
  }, [session]);

  return {
    session,
    items,
    totals,
    isLoading,
    error,
    initSession,
    searchProductByBarcode,
    addProduct,
    removeItem,
    updateQuantity,
    closeSession,
    clearItems,
  };
}