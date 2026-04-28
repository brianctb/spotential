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
import { useMapStore } from "@/store/mapStore";
import { SpotentiateButton } from "../SpotentiateButton";
import { useMenuQuery } from "@/hooks/useMenuQuery";
import { cn } from "@/lib/utils";
import {
    Utensils,
    Dumbbell,
    ShoppingBag,
    Briefcase,
    Check,
    LucideIcon
} from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBusinessMetadata } from "@/hooks/useBusinessMeta";

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

export const BusinessCategoryAccordion = ({
    showButton = false,
}: {
    showButton?: boolean;
}) => {
    const searchParams = useSearchParams()
    const businessMeta = useBusinessMetadata()
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const selectedType = useMapStore((state) => state.selectedType)
    const setSelectedType = useMapStore((state) => state.setSelectedType)

    const { data: menu, isLoading } = useMenuQuery();

    const getToolTipmMsg = () => {
        if (!selectedType && !draftPinLocation) return "Select a category and place a pin.";
        if (!selectedType) return "Please select a business category.";
        if (!draftPinLocation) return "Please place a pin on the map.";
    };

    useEffect(() => {
        if (businessMeta.size === 0) return;

        const urlType = searchParams.get("business_type");
        if (urlType && businessMeta.has(urlType)) {
            if (urlType !== selectedType) {
                setSelectedType(urlType as BusinessType);
            }
        } else if (urlType) {
            console.warn(`Invalid business type: ${urlType}`);
        }
    }, [searchParams, businessMeta]);

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading...</div>;

    if (!menu || menu.length === 0) return null;

    const activeCategoryKey = menu.find((category) =>
        category.business.some((item) => item.key === selectedType)
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
                                value={selectedType || ""}
                                onValueChange={(value) => setSelectedType(value as BusinessType)}
                            >
                                {category.business.map((item) =>
                                    <BusinessItem
                                        key={item.key}
                                        item={item}
                                        isSelected={selectedType === item.key}
                                    />
                                )}
                            </RadioGroup>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
            {showButton &&
                <div className="mt-4 w-2/3 mx-auto">
                    <SpotentiateButton />
                </div>
            }

        </Accordion >
    );
}