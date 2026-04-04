import { useState, useEffect, useCallback } from 'react';
import type { Supplier } from '../../shared/types';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.api.suppliers.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (payload: Partial<Supplier>) => {
    const result = await window.api.suppliers.create(payload);
    await fetchSuppliers();
    return result;
  };

  const updateSupplier = async (id: number, payload: Partial<Supplier>) => {
    const result = await window.api.suppliers.update({ id, ...payload });
    await fetchSuppliers();
    return result;
  };

  const deleteSupplier = async (id: number) => {
    const result = await window.api.suppliers.delete(id);
    await fetchSuppliers();
    return result;
  };

  return {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refresh: fetchSuppliers
  };
}
