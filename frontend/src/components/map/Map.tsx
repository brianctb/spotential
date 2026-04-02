"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { PinMarker } from "@/components/map/PinMarker";
import { useRef, useState } from "react";
import { MAP_CONFIG } from "@/configs/map";

export const SpotentialMap = () => {
    const mapRef = useRef<MapRef>(null);
    const [pin, setPin] = useState<{ lng: number; lat: number } | null>(null);

    return (
        <Map
            ref={mapRef}
            initialViewState={MAP_CONFIG.vancouver.center}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://tiles.openfreemap.org/styles/liberty"
            maxBounds={MAP_CONFIG.vancouver.bounds}
            minZoom={MAP_CONFIG.limits.minZoom}
            maxZoom={MAP_CONFIG.limits.maxZoom}
            onClick={(e) => {
                const { lng, lat } = e.lngLat;
                setPin({ lng, lat });
            }}
        >
            <NavigationControl position="top-right" />
            {pin && PinMarker({
                lng: pin.lng,
                lat: pin.lat
            })}
        </Map>
    );
}