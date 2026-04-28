import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const SpotentiateButton = () => {
    const router = useRouter();
    const isMobile = useIsMobile();
    const { isFetching } = useAnalysisQuery();

    const selectedType = useMapStore((state) => state.selectedType);
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const setCanShowAnalysis = useMapStore((state) => state.setCanShowAnalysis);

    const [isHovered, setIsHovered] = useState(false);
    const [mobileTooltipOpen, setMobileTooltipOpen] = useState(false);

    const isDisabled = !selectedType || !draftPinLocation || isFetching;

    const getTooltipMsg = () => {
        if (isFetching) return "Analysis in progress...";
        if (!selectedType) return "Please select a business type first";
        if (!draftPinLocation) return "Drop a pin on the map to analyze";
        return "";
    };

    const handleSpotentiate = () => {
        if (isDisabled) {
            if (isMobile) {
                setMobileTooltipOpen(true);
                setTimeout(() => setMobileTooltipOpen(false), 2000);
            }
            return;
        }

        const params = new URLSearchParams();
        params.set("business_type", selectedType);
        params.set("lat", draftPinLocation.lat.toString());
        params.set("lng", draftPinLocation.lng.toString());
        router.push(`?${params.toString()}`);
        setDraftPinLocation(null);
        setCanShowAnalysis(false);
    };

    const sparkleClass = "opacity-100 scale-125 text-yellow-400";

    return (
        <TooltipProvider>
            <Tooltip open={isMobile ? mobileTooltipOpen : undefined}>
                <TooltipTrigger asChild>
                    <div className="w-full">
                        <Button
                            size="lg"
                            className="bg-selected-blue w-full rounded-xl font-bold shadow-lg relative transition-all duration-300 text-[oklch(0.98_0.005_260)]"
                            style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                            onClick={handleSpotentiate}
                            onMouseEnter={() => !isMobile && setIsHovered(true)}
                            onMouseLeave={() => !isMobile && setIsHovered(false)}
                        >
                            <span className={cn("relative", isFetching && "animate-pulse")}>
                                {isFetching ? "Analyzing..." : "Spotentiate"}
                            </span>
                            <Sparkles
                                className={cn(
                                    "absolute right-4 transition-all duration-300",
                                    isDisabled ? "opacity-10" : isHovered ? sparkleClass : "opacity-50",
                                    isMobile && !isDisabled && sparkleClass
                                )}
                                size={18}
                            />
                        </Button>
                    </div>
                </TooltipTrigger>

                {isDisabled && (
                    <TooltipContent side="top" className="z-100 mb-2 shadow-xl border border-border bg-card">
                        <p className="text-primary text-sm">{getTooltipMsg()}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};