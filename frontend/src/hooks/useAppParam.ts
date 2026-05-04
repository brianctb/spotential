"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BusinessType } from "@/types/business";

export function useAppParams() {
    const searchParams = useSearchParams();

    return useMemo(() => {
        const selectedType = searchParams.get("business_type") as BusinessType | null;

        const lat = Number(searchParams.get("lat"));
        const lng = Number(searchParams.get("lng"));

        return {
            selectedType,
            lat,
            lng,
            isValid:
                !!selectedType &&
                !Number.isNaN(lat) &&
                !Number.isNaN(lng),
        };
    }, [searchParams]);
}