"use client";

import { useRouter } from "next/navigation";
import { useMapStore } from "@/store/mapStore";
import type { BusinessType } from "@/types/business";

export function useCommitLocation() {
    const router = useRouter();
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const setCanShowAnalysis = useMapStore((state) => state.setCanShowAnalysis);

    return (businessType: BusinessType, lat: number, lng: number) => {
        const params = new URLSearchParams();
        params.set("business_type", businessType);
        params.set("lat", lat.toString());
        params.set("lng", lng.toString());
        router.push(`?${params.toString()}`);
        setDraftPinLocation(null);
        setCanShowAnalysis(false);
    };
}
