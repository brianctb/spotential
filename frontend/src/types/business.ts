import type { components, operations } from "./generated";

export type Business = components["schemas"]["Business"];
export type BusinessType = components["schemas"]["BusinessType"];
export type BusinessCategory = components["schemas"]["BusinessCategory"];
export type BusinessCategoryResponse = components["schemas"]["BusinessCategoryResponse"];
export type BusinessTypeResponse = components["schemas"]["BusinessTypeResponse"];
export type BusinessesResponse = components["schemas"]["BusinessesResponse"];

export type GetBusinessesParams =
    operations["get_businesses_locations_businesses_get"]["parameters"]["query"];