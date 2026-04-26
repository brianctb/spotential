import { BusinessType, BusinessCategory } from "@/types/business";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from "next/navigation";
import { useMapStore } from "@/store/mapStore";
import { useState } from "react";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";
import { Button } from "../ui/button";
import { useMenuQuery } from "@/hooks/useMenuQuery";
import { cn } from "@/lib/utils";
import {
    Utensils,
    Dumbbell,
    ShoppingBag,
    Briefcase,
    Check,
    Sparkles,
    LucideIcon
} from "lucide-react";

const CATEGORY_ICONS: Record<BusinessCategory, LucideIcon> = {
    "food & drink": Utensils,
    "fitness": Dumbbell,
    "retail": ShoppingBag,
    "service": Briefcase,
};

const CategoryTrigger = ({
    label,
    icon: Icon,
    selected
}: {
    label: string;
    icon: LucideIcon
    selected?: boolean
}) => {
    return (
        <AccordionTrigger className="py-3 px-4 hover:no-underline hover:bg-accent/50 transition-colors group/radio" >
            <div className="flex items-center gap-3">
                <Icon
                    size={18}
                    className={cn(
                        "transition-colors",
                        selected
                            ? "text-selected-blue"
                            : "text-muted-foreground group-data-[state=open]/radio:text-foreground"
                    )}
                />
                <span className="text-xs font-bold uppercase text-muted-foreground group-data-[state=open]/radio:text-foreground">
                    {label}
                </span>
            </div>
        </AccordionTrigger >
    )
}

const BusinessItem = ({
    item,
    isSelected
}: {
    item: { key: string; label: string },
    isSelected: boolean
}) => {
    return (
        // Label is for converting to allow entire row click here
        // htmlFor is linked towards GroupItem ID, when this is clicked, it triggers click at ID
        <Label
            htmlFor={item.key}
            className={cn(
                "py-1.5 px-5 gap-3 rounded-md cursor-pointer transition-all w-full flex items-center",
                isSelected
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
        >
            {/* hiding default circle to replace with a custom indicator */}
            <RadioGroupItem value={item.key} id={item.key} className="sr-only absolute" />
            <div
                className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                    isSelected && "bg-selected-blue border-transparent"
                )}
            >
                {isSelected && (
                    <Check size={10} className="text-primary-foreground stroke-4" />
                )}
            </div>

            <span className="text-sm font-medium select-none">{item.label}</span>
        </Label>
    );
};

const SpotentiateButton = ({
    disabled,
    onClick,
    isFetching
}: {
    disabled: boolean;
    onClick: () => void;
    isFetching: boolean
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Button
            size="lg"
            className="bg-selected-blue w-full rounded-xl font-bold shadow-lg relative transition-all duration-300 text-[oklch(0.98_0.005_260)]"
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* change text color */}
            <span className={cn("relative",
                isFetching && "animate-pulse"
            )}>
                {isFetching ? "Analyzing..." : "Spotentiate"}

            </span>
            <Sparkles
                className={cn(
                    "absolute right-4 transition-all duration-300",
                    disabled ? "opacity-10" : isHovered ? "opacity-100 scale-125 text-yellow-400" : "opacity-50"
                )}
                size={18}
            />
        </Button>
    );
};

export const BusinessCategoryAccordion = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const setCanShowAnalysis = useMapStore((state) => state.setCanShowAnalysis)

    const [businessType, setBusinessType] = useState<BusinessType | null>(
        (searchParams.get("business_type") as BusinessType) || null
    );

    const { data: menu, isLoading } = useMenuQuery();
    const { isFetching } = useAnalysisQuery();
    const showTooltip = !businessType || !draftPinLocation;

    const handleSpotentiate = () => {
        if (!businessType || !draftPinLocation) return;
        const params = new URLSearchParams();
        params.set("business_type", businessType);
        params.set("lat", draftPinLocation.lat.toString());
        params.set("lng", draftPinLocation.lng.toString());
        router.push(`?${params.toString()}`);
        setDraftPinLocation(null);
        setCanShowAnalysis(false);
    };

    const getToolTipmMsg = () => {
        if (!businessType && !draftPinLocation) return "Select a category and place a pin.";
        if (!businessType) return "Please select a business category.";
        if (!draftPinLocation) return "Please place a pin on the map.";
    };

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading...</div>;

    if (!menu || menu.length === 0) return null;

    const activeCategoryKey = menu.find((category) =>
        category.business.some((item) => item.key === businessType)
    )?.key;

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full space-y-2"
            defaultValue={activeCategoryKey}
        >
            {menu.map((category) => {
                const Icon = CATEGORY_ICONS[category.key as BusinessCategory] || Briefcase;
                return (
                    <AccordionItem
                        key={category.key}
                        value={category.key}
                        className="border border-border rounded-lg overflow-hidden bg-card"
                    >
                        <CategoryTrigger
                            label={category.label}
                            icon={Icon}
                            selected={category.key === activeCategoryKey}
                        />

                        <AccordionContent className="pb-1 px-1">
                            <RadioGroup
                                value={businessType || ""}
                                onValueChange={(value) => setBusinessType(value as BusinessType)}
                            >
                                {category.business.map((item) =>
                                    <BusinessItem
                                        key={item.key}
                                        item={item}
                                        isSelected={businessType === item.key}
                                    />
                                )}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}

            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <div className="mt-4 w-2/3 mx-auto">
                        <SpotentiateButton
                            disabled={!businessType || !draftPinLocation || isFetching}
                            onClick={handleSpotentiate}
                            isFetching={isFetching}
                        />
                    </div>
                </TooltipTrigger>
                {showTooltip && (
                    <TooltipContent side="top" className="z-50 my-2 shadow-xl border border-border bg-card">
                        <p className="text-primary">{getToolTipmMsg()}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </Accordion >
    );
}