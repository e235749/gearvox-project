import { create } from "zustand";

import type {
  ActivityOption,
  CompanionOption,
  SeasonOption,
  SpaceOption,
  StyleOption,
  TransportOption,
} from "@/constants/context-options";

export interface ContextQuestionnaireState {
  cat1_companion: CompanionOption | null;
  cat2_style: StyleOption[];
  cat3_season: SeasonOption[];
  cat4_transport: TransportOption | null;
  cat5_activity: ActivityOption[];
  cat6_space: SpaceOption[];
  currentStep: number;
  setCompanion: (value: CompanionOption | null) => void;
  toggleStyle: (value: StyleOption) => void;
  toggleSeason: (value: SeasonOption) => void;
  setTransport: (value: TransportOption | null) => void;
  toggleActivity: (value: ActivityOption) => void;
  toggleSpace: (value: SpaceOption) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  cat1_companion: null as CompanionOption | null,
  cat2_style: [] as StyleOption[],
  cat3_season: [] as SeasonOption[],
  cat4_transport: null as TransportOption | null,
  cat5_activity: [] as ActivityOption[],
  cat6_space: [] as SpaceOption[],
  currentStep: 1,
};

function toggleItem<T>(items: T[], value: T, maxSelect?: number): T[] {
  if (items.includes(value)) {
    return items.filter((item) => item !== value);
  }
  if (maxSelect !== undefined && items.length >= maxSelect) {
    return items;
  }
  return [...items, value];
}

export const useContextQuestionnaireStore = create<ContextQuestionnaireState>(
  (set) => ({
    ...initialState,
    setCompanion: (value) => set({ cat1_companion: value }),
    toggleStyle: (value) =>
      set((state) => ({
        cat2_style: toggleItem(state.cat2_style, value, 3),
      })),
    toggleSeason: (value) =>
      set((state) => ({
        cat3_season: toggleItem(state.cat3_season, value),
      })),
    setTransport: (value) => set({ cat4_transport: value }),
    toggleActivity: (value) =>
      set((state) => ({
        cat5_activity: toggleItem(state.cat5_activity, value, 3),
      })),
    toggleSpace: (value) =>
      set((state) => ({
        cat6_space: toggleItem(state.cat6_space, value),
      })),
    setCurrentStep: (step) => set({ currentStep: step }),
    reset: () => set(initialState),
  }),
);
