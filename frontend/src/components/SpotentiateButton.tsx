import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { useMapStore } from "@/store/mapStore";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

export const SpotentiateButton = () => {

    const router = useRouter();
    const isMobile = useIsMobile()
    const { isFetching } = useAnalysisQuery()
    const selectedType = useMapStore((state) => state.selectedType)
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const setCanShowAnalysis = useMapStore((state) => state.setCanShowAnalysis)
    const [isHovered, setIsHovered] = useState(false);

    const handleSpotentiate = () => {
        if (!selectedType || !draftPinLocation) return;
        const params = new URLSearchParams();
        params.set("business_type", selectedType);
        params.set("lat", draftPinLocation.lat.toString());
        params.set("lng", draftPinLocation.lng.toString());
        router.push(`?${params.toString()}`);
        setDraftPinLocation(null);
        setCanShowAnalysis(false);
    };

    const isDisabled = !selectedType || !draftPinLocation || isFetching
    const sparkleClass = "opacity-100 scale-125 text-yellow-400"

    return (
        <Button
            size="lg"
            className="bg-selected-blue w-full rounded-xl font-bold shadow-lg relative transition-all duration-300 text-[oklch(0.98_0.005_260)]"
            disabled={!selectedType || !draftPinLocation || isFetching}
            onClick={handleSpotentiate}
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
                    isDisabled ? "opacity-10" : isHovered ? sparkleClass : "opacity-50",
                    isMobile && !isDisabled && sparkleClass
                )}
                size={18}
            />
        </Button>
    );
};