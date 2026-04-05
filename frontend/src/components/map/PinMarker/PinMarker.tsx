"use client";

import { Marker } from "react-map-gl/maplibre"
import { PinMarkerProps } from "./PinMarker.type";

export const PinMarker = ({
    lng,
    lat,
    src = "/map-pin.svg",
    alt = "map pin",
    className = "w-9 h-9",
    onClick,
}: PinMarkerProps) => {
    return (
        <Marker longitude={lng} latitude={lat} anchor="bottom">
            <img
                src={src}
                alt={alt}
                onClick={onClick}
                className={`${className} ${onClick ? "cursor-pointer" : "cursor-default"}`}
            />
        </Marker>
    );
};