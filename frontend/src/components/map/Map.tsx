"use client";

import Map, { NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { PinMarker } from "@/components/map/PinMarker/PinMarker";
import { BusinessMarkrs } from "@/components/map/PinMarker/BusinessMarkers";
import { useRef } from "react";
import { MAP_CONFIG } from "@/configs/map";
import { useMapStore } from "@/store/mapStore";
import { TractLayer } from "./TractLayer";
import { BusinessLayer } from "./BusinessLayer";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";

export const SpotentialMap = () => {

    // map setup
    const mapRef = useRef<MapRef>(null);
    const onMapLoad = async () => {
        const map = mapRef.current?.getMap();
        if (!map) return;
        if (map.hasImage("business-marker")) return;
        try {
            const response = await map.loadImage("/business-marker.png");
            map.addImage("business-marker", response.data);
            console.log("Marker loaded successfully");
        } catch (error) {
            console.error("Failed to load map icon:", error);
        }
    };

    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const searchPinLocation = useMapStore((state) => state.searchPin);

    const { data: analysis } = useAnalysisQuery();

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
            onLoad={onMapLoad}
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

            {analysis && (
                <>
                    <TractLayer data={analysis.census} />
                    <BusinessLayer data={analysis.businesses} />
                </>
            )}

            {/* <BusinessMarkrs /> */}
        </Map>
    );
}