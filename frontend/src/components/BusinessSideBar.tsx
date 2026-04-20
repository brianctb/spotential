"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { businessApi } from "@/api/business";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader
} from "@/components/ui/sidebar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BusinessCategoryResponse, BusinessType } from "@/types/business";
import { useMapStore } from "@/store/mapStore";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";

export function BusinessSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const draftPinLocation = useMapStore((state) => state.draftPin);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);

    const [businessType, setBusinessType] = useState<BusinessType | null>(
        (searchParams.get("business_type") as BusinessType) || null
    );

    const { data: menu } = useQuery<BusinessCategoryResponse[]>({
        queryKey: ["business-menu"],
        queryFn: businessApi.getMenu,
        staleTime: Infinity,
    });

    const { isFetching } = useAnalysisQuery();

    const handleSpotentiate = () => {
        if (!businessType || !draftPinLocation) return;

        // Create the new URL with params
        const params = new URLSearchParams();
        params.set("business_type", businessType);
        params.set("lat", draftPinLocation.lat.toString());
        params.set("lng", draftPinLocation.lng.toString());

        // Update the browser URL
        router.push(`?${params.toString()}`);

        // Clear the draft pin from the map
        setDraftPinLocation(null);
    };

    return (
        <Sidebar className="border-r">
            <SidebarHeader>
                <h1 className="text-lg font-bold">Spotential</h1>
            </SidebarHeader>

            <SidebarContent className="px-5">
                <p className="text-sm text-muted-foreground mb-2">
                    Select a business type
                </p>

                <Accordion type="multiple" className="w-full">
                    {menu?.map((category) => (
                        <SidebarGroup key={category?.key}>
                            <AccordionItem value={category.key}>
                                <AccordionTrigger>
                                    <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <SidebarGroupContent>
                                        <RadioGroup
                                            value={businessType || ""}
                                            onValueChange={(value) => setBusinessType(value as BusinessType)}
                                            className="space-y-1"
                                        >
                                            {category.business.map((business) => (
                                                <div key={business.key} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={business.key} id={business.key} />
                                                    <Label htmlFor={business.key}>{business.label}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </SidebarGroupContent>
                                </AccordionContent>
                            </AccordionItem>
                        </SidebarGroup>
                    ))}
                </Accordion>

                <div className="mt-4 flex justify-center">
                    <Button
                        className="w-40"
                        disabled={!businessType || !draftPinLocation || isFetching}
                        onClick={handleSpotentiate}
                    >
                        {isFetching ? "Analyzing..." : "Spotentiate"}
                    </Button>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}