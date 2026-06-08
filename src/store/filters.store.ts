import { create } from "zustand";

type FiltersState = {
  tripSearch: string;
  expenseSearch: string;
  statusFilter: string;
  setTripSearch: (value: string) => void;
  setExpenseSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  tripSearch: "",
  expenseSearch: "",
  statusFilter: "todos",
  setTripSearch: (tripSearch) => set({ tripSearch }),
  setExpenseSearch: (expenseSearch) => set({ expenseSearch }),
  setStatusFilter: (statusFilter) => set({ statusFilter })
}));
