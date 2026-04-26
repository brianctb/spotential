import { create } from "zustand";
import type { BusinessType } from "@/types/business";

export interface PinLocation {
    lat: number;
    lng: number;
}

interface MapStore {
    selectedType: BusinessType | null;
    searchPin: PinLocation | null;
    draftPin: PinLocation | null;
    canShowAnalysis: boolean

    setSelectedType: (type: BusinessType | null) => void;
    setDraftPin: (location: PinLocation | null) => void;
    setSearchPin: (location: PinLocation | null) => void;
    setCanShowAnalysis: (value: boolean) => void
    reset: () => void;
}

const initialState = {
    selectedType: null,
    searchPin: null,
    draftPin: null,
    canShowAnalysis: true
};

export const useMapStore = create<MapStore>((set) => ({
    ...initialState,

    setSelectedType: (type) => set({ selectedType: type }),
    setDraftPin: (location) => set({ draftPin: location }),
    setSearchPin: (location) => set({ searchPin: location }),
    setCanShowAnalysis: (value) => set({ canShowAnalysis: value }),
    reset: () => set(initialState),
}));