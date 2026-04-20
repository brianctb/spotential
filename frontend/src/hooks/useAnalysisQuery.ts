"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation"; // Pull from the URL
import { analysisApi } from "@/api/analysis";
import { AnalysisData } from "@/types/analysis";
import { BusinessType } from "@/types/business";

export function useAnalysisQuery() {
    const searchParams = useSearchParams();

    const selectedType =
        searchParams.get("business_type") as BusinessType | null;

    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    const isValidCoords =
        !Number.isNaN(lat) &&
        !Number.isNaN(lng);

    const isValid =
        !!selectedType &&
        isValidCoords;

    return useQuery<AnalysisData>({
        queryKey: ["analysis", selectedType, lng, lat],

        queryFn: () =>
            analysisApi.getAnalysis({
                business_type: selectedType!,
                lng,
                lat,
            }),

        enabled: isValid,

        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
    });
}