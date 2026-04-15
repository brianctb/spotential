"use client";

import { Marker } from "react-map-gl/maplibre"
import { useQuery } from "@tanstack/react-query";
import { useMapStore } from "@/store/mapStore";
import { PinMarkerSrcProps } from "./PinMarker.type";
import { analysisApi } from "@/api/analysis";

export const BusinessMarkrs = ({
    src = "/map-pin.svg",
    alt = "map pin",
    className = "w-4 h-4",
}: PinMarkerSrcProps) => {

    const selectedType = useMapStore((state) => state.selectedType);
    const pinLocation = useMapStore((state) => state.searchPin);
    // data is cached from the sidebar component query
    // only retrieves from cache, does not make a new request
    const { data } = useQuery({
        queryKey: ["analysis", selectedType, pinLocation?.lng, pinLocation?.lat],
        queryFn: () =>
            analysisApi.getAnalysis({
                business_type: selectedType!,
                lng: pinLocation!.lng,
                lat: pinLocation!.lat
            }),
        enabled: !!selectedType && !!pinLocation
    });
    const businesses = data?.businesses.features

    return (
        businesses?.map((business) => (
            <Marker
                key={business.properties.osm_id}
                longitude={business.properties.lng}
                latitude={business.properties.lat}
                anchor="bottom"
            >
                <img
                    src={src}
                    alt={alt}
                    className={className}
                />
            </Marker>
        ))
    );
};