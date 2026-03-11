import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  selectedDomains: number[];
  comparisonMode: boolean;
  dashboardBuilderState: {
    selectedFields: string[];
    currentChartType: string;
  };
  setSelectedDomains: (domains: number[]) => void;
  toggleComparisonMode: () => void;
  setDashboardBuilderState: (state: Partial<AppState["dashboardBuilderState"]>) => void;
  addSelectedField: (field: string) => void;
  removeSelectedField: (field: string) => void;
  resetDashboardBuilder: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedDomains: [],
      comparisonMode: false,
      dashboardBuilderState: {
        selectedFields: [],
        currentChartType: "bar",
      },
      setSelectedDomains: (domains) => set({ selectedDomains: domains }),
      toggleComparisonMode: () => set((state) => ({ comparisonMode: !state.comparisonMode })),
      setDashboardBuilderState: (newState) =>
        set((state) => ({
          dashboardBuilderState: { ...state.dashboardBuilderState, ...newState },
        })),
      addSelectedField: (field) =>
        set((state) => ({
          dashboardBuilderState: {
            ...state.dashboardBuilderState,
            selectedFields: [...state.dashboardBuilderState.selectedFields, field],
          },
        })),
      removeSelectedField: (field) =>
        set((state) => ({
          dashboardBuilderState: {
            ...state.dashboardBuilderState,
            selectedFields: state.dashboardBuilderState.selectedFields.filter((f) => f !== field),
          },
        })),
      resetDashboardBuilder: () =>
        set({
          dashboardBuilderState: {
            selectedFields: [],
            currentChartType: "bar",
          },
        }),
    }),
    {
      name: "ai-powered-analytics-store",
    }
  )
);
