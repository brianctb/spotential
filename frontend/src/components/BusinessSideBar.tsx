"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { cn } from "@/lib/utils";

export function BusinessSidebar() {

    // store states
    const setSelectedType = useMapStore((state) => state.setSelectedType);
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const setSearchPinLocation = useMapStore((state) => state.setSearchPin);
    const [businessType, setBusinessType] = useState<BusinessType | null>(null);

    // fetching
    const { data: menu, isLoading, isError } = useQuery<BusinessCategoryResponse[]>({
        queryKey: ["business-menu"],
        queryFn: businessApi.getMenu,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });

    const { isFetching } = useAnalysisQuery();

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
                        // each category is a group
                        <SidebarGroup key={category?.key}>
                            <AccordionItem value={category.key}>
                                <AccordionTrigger>
                                    <SidebarGroupLabel>
                                        {category.label}
                                    </SidebarGroupLabel>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <SidebarGroupContent>
                                        <RadioGroup
                                            value={businessType}
                                            onValueChange={(value) => setBusinessType(value as BusinessType)}
                                            className="space-y-1"
                                        >
                                            {category.business.map((business) => (
                                                <div
                                                    key={business.key}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <RadioGroupItem
                                                        value={business.key}
                                                        id={business.key}
                                                    />
                                                    <Label htmlFor={business.key}>
                                                        {business.label}
                                                    </Label>
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
                        onClick={() => {
                            setSelectedType(businessType);
                            setSearchPinLocation(draftPinLocation);
                            setDraftPinLocation(null);
                        }}
                    >
                        Spotentiate
                    </Button>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}