import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BacklogItem } from '@/types/backlog';
import * as backlogService from '@/services/backlogService';
import { toast } from 'sonner';

interface BacklogContextType {
  items: BacklogItem[];
  loading: boolean;
  addItem: (input: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<BacklogItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined);

export function BacklogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await backlogService.fetchBacklogItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load backlog items', err);
      toast.error('Failed to load backlog items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = useCallback(async (input: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await backlogService.createBacklogItem({
        title: input.title,
        description: input.description,
        reporter: input.reporter,
        priority: input.priority,
        status: input.status,
        version: input.version,
      });
      setItems(prev => [created, ...prev]);
      toast.success('Backlog item created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create backlog item');
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<BacklogItem>) => {
    try {
      const updated = await backlogService.updateBacklogItem(id, {
        title: updates.title,
        description: updates.description,
        reporter: updates.reporter,
        priority: updates.priority,
        status: updates.status,
        version: updates.version,
      });
      setItems(prev => prev.map(i => (i.id === id ? updated : i)));
      toast.success('Backlog item updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update backlog item');
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await backlogService.deleteBacklogItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Backlog item deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete backlog item');
      throw err;
    }
  }, []);

  return (
    <BacklogContext.Provider value={{ items, loading, addItem, updateItem, deleteItem, refetch: load }}>
      {children}
    </BacklogContext.Provider>
  );
}

export function useBacklog() {
  const ctx = useContext(BacklogContext);
  if (!ctx) throw new Error('useBacklog must be used within BacklogProvider');
  return ctx;
}

