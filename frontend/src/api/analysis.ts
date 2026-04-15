import { apiClient } from "./client";
import { AnalysisData, AnalysisParams } from "@/types/analysis";

export const analysisApi = {
    getAnalysis: (params: AnalysisParams) =>
        apiClient.get<AnalysisData>("/locations/analysis", params),
};