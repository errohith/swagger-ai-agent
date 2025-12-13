import { create } from 'zustand';
import { ExecutionResult, executionService } from '@/services/api';

interface ExecutionState {
  executions: ExecutionResult[];
  selectedExecution: ExecutionResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchExecutions: (specId?: string) => Promise<void>;
  selectExecution: (execution: ExecutionResult | null) => void;
  addExecution: (execution: ExecutionResult) => void;
  updateExecution: (execution: ExecutionResult) => void;
  removeExecution: (runId: string) => void;
  clearError: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  executions: [],
  selectedExecution: null,
  isLoading: false,
  error: null,

  fetchExecutions: async (specId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const executions = await executionService.listExecutions(specId);
      set({ executions, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch executions',
        isLoading: false 
      });
    }
  },

  selectExecution: (execution) => {
    set({ selectedExecution: execution });
  },

  addExecution: (execution) => {
    set((state) => ({ executions: [execution, ...state.executions] }));
  },

  updateExecution: (execution) => {
    set((state) => ({
      executions: state.executions.map((e) => 
        e.runId === execution.runId ? execution : e
      ),
      selectedExecution: state.selectedExecution?.runId === execution.runId 
        ? execution 
        : state.selectedExecution,
    }));
  },

  removeExecution: (runId) => {
    set((state) => ({
      executions: state.executions.filter((e) => e.runId !== runId),
      selectedExecution: state.selectedExecution?.runId === runId 
        ? null 
        : state.selectedExecution,
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));
