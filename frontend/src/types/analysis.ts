import type { components, operations } from "./generated";

export type AnalysisData = components["schemas"]["AnalysisResponse"];

export type AnalysisParams = operations["get_analysis_locations_analysis_get"]["parameters"]["query"];
