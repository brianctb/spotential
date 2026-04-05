"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { PinMarker } from "@/components/map/PinMarker/PinMarker";
import { BusinessMarkrs } from "@/components/map/PinMarker/BusinessMarkers";
import { useRef, useState } from "react";
import { MAP_CONFIG } from "@/configs/map";
import { useMapStore } from "@/store/mapStore";

export const SpotentialMap = () => {
    const mapRef = useRef<MapRef>(null);
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const searchPinLocation = useMapStore((state) => state.searchPin);

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
                setDraftPinLocation({ lng, lat });
            }}
        >
            <NavigationControl position="top-right" />
            {draftPinLocation && (
                <PinMarker
                    lng={draftPinLocation.lng}
                    lat={draftPinLocation.lat}
                />
            )}

            {searchPinLocation && (
                <PinMarker
                    lng={searchPinLocation.lng}
                    lat={searchPinLocation.lat}
                />
            )}
            <BusinessMarkrs />
        </Map>
    );
}