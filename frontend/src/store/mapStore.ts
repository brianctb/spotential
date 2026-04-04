import { create } from "zustand";
import type { BusinessType } from "@/types/business";

interface PinLocation {
    lat: number;
    lng: number;
}

interface MapStore {
    selectedType: BusinessType | null;
    pinLocation: PinLocation | null;

    setSelectedType: (type: BusinessType | null) => void;
    setPinLocation: (location: PinLocation | null) => void;
    reset: () => void;
}

const initialState = {
    selectedType: null,
    pinLocation: null,
};

export const useMapStore = create<MapStore>((set) => ({
    ...initialState,

    setSelectedType: (type) => set({ selectedType: type }),
    setPinLocation: (location) => set({ pinLocation: location }),
    reset: () => set({ selectedType: null, pinLocation: null }),
}));