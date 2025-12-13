import { create } from 'zustand';
import { Spec, specService } from '@/services/api';

interface SpecState {
  specs: Spec[];
  selectedSpec: Spec | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSpecs: () => Promise<void>;
  selectSpec: (spec: Spec | null) => void;
  addSpec: (spec: Spec) => void;
  removeSpec: (specId: string) => void;
  clearError: () => void;
}

export const useSpecStore = create<SpecState>((set) => ({
  specs: [],
  selectedSpec: null,
  isLoading: false,
  error: null,

  fetchSpecs: async () => {
    set({ isLoading: true, error: null });
    try {
      const specs = await specService.listSpecs();
      set({ specs, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch specs',
        isLoading: false 
      });
    }
  },

  selectSpec: (spec) => {
    set({ selectedSpec: spec });
  },

  addSpec: (spec) => {
    set((state) => ({ specs: [...state.specs, spec] }));
  },

  removeSpec: (specId) => {
    set((state) => ({
      specs: state.specs.filter((s) => s.id !== specId),
      selectedSpec: state.selectedSpec?.id === specId ? null : state.selectedSpec,
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
