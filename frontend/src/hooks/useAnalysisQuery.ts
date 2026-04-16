import { useQuery } from "@tanstack/react-query";
import { analysisApi } from "@/api/analysis";
import { useMapStore } from "@/store/mapStore";
import { AnalysisData } from "@/types/analysis";


export function useAnalysisQuery() {
    const selectedType = useMapStore((state) => state.selectedType);
    const searchPinLocation = useMapStore((state) => state.searchPin);
    return useQuery<AnalysisData>({
        queryKey: ["analysis", selectedType, searchPinLocation?.lng, searchPinLocation?.lat],
        queryFn: () =>
            analysisApi.getAnalysis({
                business_type: selectedType!,
                lng: searchPinLocation!.lng,
                lat: searchPinLocation!.lat
            }),
        enabled: !!selectedType && !!searchPinLocation?.lng && !!searchPinLocation?.lat,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
    });
}