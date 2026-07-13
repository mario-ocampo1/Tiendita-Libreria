'use client';

import { useState } from 'react';

interface MovementFormState {
  type: 'income' | 'expense';
  description: string;
  amount: string;
}

export default function CashActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<MovementFormState>({
    type: 'income',
    description: '',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Enviar a Supabase
    console.log('Movimiento registrado:', formData);
    setFormData({ type: 'income', description: '', amount: '' });
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Botones de acciones rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition"
        >
          ➕ Registrar ingreso
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 font-medium transition">
          ➖ Registrar egreso
        </button>
        <button className="bg-[#1a237e] hover:bg-[#283593] text-white rounded-lg py-3 font-medium transition">
          🔄 Arqueo
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-3 font-medium transition">
          📋 Reportes
        </button>
      </div>

      {/* Formulario modal */}
      {isOpen && (
        <div className="bg-[#FFFBF0] rounded-2xl p-6 border border-[#e8eaf6]">
          <h3 className="text-lg font-semibold text-[#1a237e] mb-4">
            Registrar movimiento
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de movimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as 'income' | 'expense',
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="income">Ingreso</option>
                <option value="expense">Egreso</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ej: Venta manual, préstamo, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto ($)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-medium transition"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg py-2 font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
