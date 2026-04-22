import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverAnchor,
    PopoverHeader,
    PopoverTitle
} from "@/components/ui/popover";
import { PinMarker } from "./PinMarker";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";
import { Progress } from "@/components/ui/progress";

interface SearchPinProps {
    lat: number;
    lng: number;
}

export const SearchPin = ({ lat, lng }: SearchPinProps) => {
    const { data: analysis } = useAnalysisQuery();
    const tractStats = analysis?.tract_stats

    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            {/* PopoverAnchor tells the popover to attach to the pin without adding click logic */}
            <PopoverAnchor asChild>
                <PinMarker
                    lng={lng}
                    lat={lat}
                    className="w-9 h-9 transition-transform hover:scale-150 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                    }}
                />
            </PopoverAnchor>

            <PopoverContent className="w-64 p-4" side="top" align="center">
                <PopoverHeader>
                    <PopoverTitle className="text-md font-semibold border-b border-gray-200 pb-2">
                        {`Tract - ${tractStats?.tract_id}`}
                    </PopoverTitle>
                </PopoverHeader>
                <div className="space-y-4 pt-2">
                    {/* Score Section */}
                    {tractStats?.score != null && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Opportunity Score</span>
                                <span className="font-bold">{tractStats.score.toFixed(2)}</span>
                            </div>
                            <Progress value={tractStats.score} className="h-2" />
                        </div>
                    )}

                    {/* Counts Section */}
                    <div className="space-y-1.5">
                        {tractStats?.predicted_count != null && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Predicted Demand</span>
                                <span className="font-semibold">{Math.round(tractStats.predicted_count)}</span>
                            </div>
                        )}

                        {tractStats?.actual_count != null && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Existing Businesses</span>
                                <span className="font-semibold">{tractStats.actual_count}</span>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};