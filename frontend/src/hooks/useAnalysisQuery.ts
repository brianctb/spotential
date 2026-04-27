"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation"; // Pull from the URL
import { analysisApi } from "@/api/analysis";
import { AnalysisData } from "@/types/analysis";
import { BusinessType } from "@/types/business";
import { useMemo } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAnalysisQuery() {
    const searchParams = useSearchParams();

    const { selectedType, lat, lng, isValid } = useMemo(() => {
        const selectedType =
            searchParams.get("business_type") as BusinessType | null;

        const latParam = searchParams.get("lat");
        const lngParam = searchParams.get("lng");

        if (!selectedType || !latParam || !lngParam) {
            return { selectedType: null, lat: null, lng: null, isValid: false };
        }

        const lat = Number(latParam);
        const lng = Number(lngParam);

        const isValidCoords =
            !Number.isNaN(lat) &&
            !Number.isNaN(lng);

        const isValid =
            !!selectedType &&
            isValidCoords;

        return { selectedType, lat, lng, isValid };
    }, [searchParams]);

    return useQuery<AnalysisData>({
        queryKey: ["analysis", selectedType, lat, lng],

        queryFn: async () => {
            // await sleep(5000);

            return analysisApi.getAnalysis({
                business_type: selectedType!,
                lng: lng!,
                lat: lat!,
            })
        },

        enabled: isValid,

        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
    });
}