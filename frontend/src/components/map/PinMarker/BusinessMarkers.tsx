"use client";

import { Marker } from "react-map-gl/maplibre"
import { useQuery } from "@tanstack/react-query";
import { businessApi } from "@/api/business";
import { useMapStore } from "@/store/mapStore";
import { PinMarkerSrcProps } from "./PinMarker.type";

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
        queryKey: ["businesses", selectedType, pinLocation?.lng, pinLocation?.lat],
        queryFn: () =>
            businessApi.getBusinesses(
                selectedType!,
                pinLocation!.lng,
                pinLocation!.lat
            ),
        enabled: !!selectedType && !!pinLocation
    });
    const businesses = data?.businesses;

    return (
        businesses?.map((business) => (
            <Marker
                key={business.id}
                longitude={business.lng}
                latitude={business.lat}
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