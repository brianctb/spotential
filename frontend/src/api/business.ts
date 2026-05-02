import { apiClient } from "./client";
import { BusinessCategoryResponse } from "@/types/business";

export const businessApi = {
    getMenu: () =>
        apiClient.get<BusinessCategoryResponse[]>("/business/menu"),
};