import type { components, operations } from "./generated";

export type BusinessType = components["schemas"]["BusinessType"];
export type BusinessCategoryResponse = components["schemas"]["BusinessCategoryResponse"];
export type BusinessesResponse = components["schemas"]["BusinessesResponse"];

export type GetBusinessesParams =
    operations["get_businesses_locations_businesses_get"]["parameters"]["query"];

export type BusinessCollection = components["schemas"]["BusinessCollection"];

export type BusinessBase = components["schemas"]["BusinessBase"];

export type BusinessCategory = components["schemas"]["BusinessCategory"]