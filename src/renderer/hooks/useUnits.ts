import { useState, useEffect, useCallback } from 'react';
import { unitsService } from '../services/units.service';

export function useUnits() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await unitsService.getAll();
      setUnits(data);
    } catch (err) {
      setError('Failed to load units');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createUnit = async (name: string, shortName?: string) => {
    try {
      await unitsService.create(name, shortName);
      await loadData();
    } catch (err) {
      setError('Failed to create unit');
      throw err;
    }
  };

  const deleteUnit = async (id: number) => {
    try {
      await unitsService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete unit');
      throw err;
    }
  };

  return {
    units,
    loading,
    error,
    refresh: loadData,
    createUnit,
    deleteUnit
  };
}
