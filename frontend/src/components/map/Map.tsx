"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { PinMarker } from "@/components/map/PinMarker";
import { useRef, useState } from "react";
import { MAP_CONFIG } from "@/configs/map";
import { useMapStore } from "@/store/mapStore";

export const SpotentialMap = () => {
    const mapRef = useRef<MapRef>(null);
    const setPinLocation = useMapStore((state) => state.setPinLocation);
    const pinLocation = useMapStore((state) => state.pinLocation);

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
                setPinLocation({ lng, lat });
            }}
        >
            <NavigationControl position="top-right" />
            {pinLocation && PinMarker({
                lng: pinLocation.lng,
                lat: pinLocation.lat
            })}
        </Map>
    );
}