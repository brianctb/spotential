import { BusinessType } from "@/types/business";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { useMapStore } from "@/store/mapStore";
import { useState } from "react";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";
import { Button } from "../ui/button";
import { useMenuQuery } from "@/hooks/useMenuQuery";


export const BusinessCategoryAccordion = () => {

    const router = useRouter();
    const searchParams = useSearchParams();
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);

    const [businessType, setBusinessType] = useState<BusinessType | null>(
        (searchParams.get("business_type") as BusinessType) || null
    );

    const { data: menu, isLoading } = useMenuQuery();
    const { isFetching } = useAnalysisQuery();
    const showTooltip = !businessType || !draftPinLocation;

    const handleSpotentiate = () => {
        if (!businessType || !draftPinLocation) return;

        // Create the new URL with params
        const params = new URLSearchParams();
        params.set("business_type", businessType);
        params.set("lat", draftPinLocation.lat.toString());
        params.set("lng", draftPinLocation.lng.toString());
        router.push(`?${params.toString()}`);

        // Clear the draft pin from the map
        setDraftPinLocation(null);
    };


    const getToolTipmMsg = () => {
        if (!businessType && !draftPinLocation) {
            return "Please select a business category and place a pin on the map.";
        }
        if (!businessType) {
            return "Please select a business category.";
        }
        if (!draftPinLocation) {
            return "Please place a pin on the map to indicate the location.";
        }
    }

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading categories...</div>;
    if (!menu || menu.length === 0) return null;

    const activeCategoryKey = menu.find((category) =>
        category.business.some((item) => item.key === businessType)
    )?.key;

    return (
        <Accordion
            type="multiple"
            className="w-full"
            defaultValue={activeCategoryKey ? [activeCategoryKey] : []}
        >
            {menu.map((category) => (
                <AccordionItem
                    key={category.key}
                    value={category.key}
                    className="border-none"
                >
                    <AccordionTrigger className="py-2 hover:no-underline px-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">
                            {category.label}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 px-2">
                        <RadioGroup
                            value={businessType || ""}
                            onValueChange={(value) => setBusinessType(value as BusinessType)}
                            className="space-y-1"
                        >
                            {category.business.map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-accent transition-colors"
                                >
                                    <RadioGroupItem value={item.key} id={item.key} />
                                    <Label
                                        htmlFor={item.key}
                                        className="flex-1 cursor-pointer text-sm"
                                    >
                                        {item.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </AccordionContent>
                </AccordionItem>
            ))}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="mt-4 flex justify-center">
                        <Button
                            className="w-40"
                            disabled={!businessType || !draftPinLocation || isFetching}
                            onClick={handleSpotentiate}
                        >
                            {isFetching ? "Analyzing..." : "Spotentiate"}
                        </Button>
                    </div>
                </TooltipTrigger>

                {showTooltip && (
                    <TooltipContent side="top" align="center" className="max-w-60 z-40">
                        {getToolTipmMsg()}
                    </TooltipContent>
                )}
            </Tooltip>
        </Accordion>
    );
}