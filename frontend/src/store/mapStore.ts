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

    setSelectedType: (type: BusinessType | null) => void;
    setDraftPin: (location: PinLocation | null) => void;
    setSearchPin: (location: PinLocation | null) => void;
    reset: () => void;
}

const initialState = {
    selectedType: null,
    searchPin: null,
    draftPin: null,
};

export const useMapStore = create<MapStore>((set) => ({
    ...initialState,

    setSelectedType: (type) => set({ selectedType: type }),
    setDraftPin: (location) => set({ draftPin: location }),
    setSearchPin: (location) => set({ searchPin: location }),
    reset: () => set({
        selectedType: null,
        searchPin: null,
        draftPin: null
    }),
}));