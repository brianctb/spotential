import { useMemo } from "react";
import { useMenuQuery } from "@/hooks/useMenuQuery";
import { BusinessCategoryResponse, BusinessTypeResponse } from "@/types/business";

type MenuNode = BusinessCategoryResponse | BusinessTypeResponse;

const flattenMetadata = (items: MenuNode[]) => {
    let flatMap = new Map<string, { label: string }>();

    items.forEach((item) => {
        flatMap.set(item.key, { label: item.label });

        const children = "business" in item ? item.business : undefined;
        if (children && Array.isArray(children)) {
            const subMap = flattenMetadata(children);
            flatMap = new Map([...flatMap, ...subMap]);
        }
    });

    return flatMap;
};

export const useBusinessMetadata = () => {
    const { data: menu } = useMenuQuery();

    return useMemo(() => {
        if (!menu) return new Map<string, { label: string }>();
        return flattenMetadata(menu);
    }, [menu]);
};