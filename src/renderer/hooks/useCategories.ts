import { useState, useEffect, useCallback } from 'react';
import type { Category } from '../../shared/types';
import { categoriesService } from '../services/categories.service';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await categoriesService.getAll();
      setCategories(cats);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createCategory = async (name: string) => {
    try {
      await categoriesService.create(name);
      await loadData();
    } catch (err) {
      setError('Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      await categoriesService.update(id, name);
      await loadData();
    } catch (err) {
      setError('Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoriesService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    refresh: loadData,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
