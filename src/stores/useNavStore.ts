import { create } from "zustand";

export type PageId = "dashboard" | "swap" | "party" | "savings";

type NavState = {
  currentPage: PageId;
  navigate: (page: PageId) => void;
};

export const useNavStore = create<NavState>((set) => ({
  currentPage: "dashboard",
  navigate: (page) => set({ currentPage: page }),
}));
