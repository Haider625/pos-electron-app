import { useState, useEffect, useCallback } from 'react';
import type { SubCategory } from '../../shared/types';
import { subCategoriesService } from '../services/subCategories.service';

export function useSubCategories() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subCategoriesService.getAll();
      setSubCategories(data);
    } catch (err) {
      setError('Failed to load sub-categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createSubCategory = async (name: string, categoryId: number) => {
    try {
      await subCategoriesService.create(name, categoryId);
      await loadData();
    } catch (err) {
      setError('Failed to create sub-category');
      throw err;
    }
  };

  const deleteSubCategory = async (id: number) => {
    try {
      await subCategoriesService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete sub-category');
      throw err;
    }
  };

  return {
    subCategories,
    loading,
    error,
    refresh: loadData,
    createSubCategory,
    deleteSubCategory
  };
}
