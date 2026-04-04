import { useState, useEffect, useCallback } from 'react';
import type { Brand } from '../../shared/types';
import { brandsService } from '../services/brands.service';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandsService.getAll();
      setBrands(data);
    } catch (err) {
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const createBrand = async (name: string) => {
    try {
      await brandsService.create(name);
      await loadBrands();
    } catch (err) {
      setError('Failed to create brand');
      throw err;
    }
  };

  const updateBrand = async (id: number, name: string) => {
    try {
      await brandsService.update(id, name);
      await loadBrands();
    } catch (err) {
      setError('Failed to update brand');
      throw err;
    }
  };

  const deleteBrand = async (id: number) => {
    try {
      await brandsService.delete(id);
      await loadBrands();
    } catch (err) {
      setError('Failed to delete brand');
      throw err;
    }
  };

  return { brands, loading, error, refresh: loadBrands, createBrand, updateBrand, deleteBrand };
}
