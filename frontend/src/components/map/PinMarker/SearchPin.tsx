"use client";

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

interface SearchPinProps {
    lat: number;
    lng: number;
    title?: string;
    description?: string;
}

export const SearchPin = ({ lat, lng, title, description }: SearchPinProps) => {

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
                    <PopoverTitle className="text-lg font-semibold border-b border-gray-200 pb-2">
                        {title || "Tract"}
                    </PopoverTitle>
                </PopoverHeader>
                <p className="text-sm text-muted-foreground">
                    {description || "No additional information available."}
                </p>
            </PopoverContent>
        </Popover>
    );
};