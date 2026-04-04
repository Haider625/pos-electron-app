import { useState, useEffect, useCallback } from 'react';
import type { Customer } from '../../shared/types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.api.customers.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (payload: Partial<Customer>) => {
    const result = await window.api.customers.create(payload);
    await fetchCustomers();
    return result;
  };

  const updateCustomer = async (id: number, payload: Partial<Customer>) => {
    const result = await window.api.customers.update({ id, ...payload });
    await fetchCustomers();
    return result;
  };

  const deleteCustomer = async (id: number) => {
    const result = await window.api.customers.delete(id);
    await fetchCustomers();
    return result;
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refresh: fetchCustomers
  };
}
