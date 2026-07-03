"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { Marker } from "react-map-gl/maplibre";
import { PinMarkerProps } from "@/types/PinMarker.type";
import { cn } from "@/lib/utils";

export const PinMarker = forwardRef<HTMLImageElement, PinMarkerProps>(({
    lng,
    lat,
    src = "/map-pin.svg",
    alt = "map pin",
    className = "w-9 h-9",
    onClick,
    overlay
}, ref) => {
    return (
        <Marker longitude={lng} latitude={lat} anchor="bottom">
            <div className="relative">
                {overlay}
                <div className={cn("relative", className)}>
                    <Image
                        ref={ref}
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain"
                        onClick={onClick}
                    />
                </div>
            </div>
        </Marker>
    )
});

PinMarker.displayName = "PinMarker";
