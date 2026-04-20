"use client";

import { forwardRef } from "react";
import { Marker } from "react-map-gl/maplibre";
import { PinMarkerProps } from "@/types/PinMarker.type";

export const PinMarker = forwardRef<HTMLImageElement, PinMarkerProps>(({
    lng,
    lat,
    src = "/map-pin.svg",
    alt = "map pin",
    className = "w-9 h-9",
    onClick,
    ...props
}, ref) => {
    return (
        <Marker longitude={lng} latitude={lat} anchor="bottom">
            <img
                ref={ref}
                src={src}
                alt={alt}
                className={className}
                onClick={onClick}
                {...props}
            />
        </Marker>
    )
});
