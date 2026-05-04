"use client";

import { useQuery } from "@tanstack/react-query";
import { analysisApi } from "@/api/analysis";
import { AnalysisData } from "@/types/analysis";
import { useAppParams } from "./useAppParam";

export function useAnalysisQuery() {
    const { selectedType, lat, lng, isValid } = useAppParams()

    return useQuery<AnalysisData>({
        queryKey: ["analysis", selectedType, lat, lng],

        queryFn: () => {
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