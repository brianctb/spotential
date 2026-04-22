import { useMemo } from "react";
import { useMenuQuery } from "@/hooks/useMenuQuery";

const flattenMetadata = (items: any[]) => {
    let flatMap = new Map();

    items.forEach((item) => {
        flatMap.set(item.key, { label: item.label });

        const children = item.business;
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
        if (!menu) return new Map();
        return flattenMetadata(menu);
    }, [menu]);
};