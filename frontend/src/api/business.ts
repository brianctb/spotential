import { apiClient } from "./client";
import { BusinessCategoryResponse, BusinessesResponse } from "@/types/business";

export const businessApi = {
    getMenu: () =>
        apiClient.get<BusinessCategoryResponse[]>("/business/menu"),
    getBusinesses: (business_type: string, lng: number, lat: number) =>
        apiClient.get<BusinessesResponse>("/locations/businesses", { business_type, lng, lat }),
};