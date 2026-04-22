import { useQuery } from "@tanstack/react-query";
import { businessApi } from "@/api/business";
import { BusinessCategoryResponse } from "@/types/business";


export const useMenuQuery = () => {
    return useQuery<BusinessCategoryResponse[]>({
        queryKey: ["business-menu"],
        queryFn: businessApi.getMenu,
        staleTime: Infinity,
    });
}

