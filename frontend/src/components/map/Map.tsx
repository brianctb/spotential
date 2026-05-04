"use client";

import Map from "react-map-gl/maplibre";
import type { MapLayerMouseEvent, MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { PinMarker } from "@/components/map/PinMarker/PinMarker";
import { useEffect, useRef, useState } from "react";
import { MAP_CONFIG } from "@/configs/map";
import { PinLocation, useMapStore } from "@/store/mapStore";
import { TractLayer } from "./TractLayer";
import { BusinessLayer } from "./BusinessLayer";
import { useAnalysisQuery } from "@/hooks/useAnalysisQuery";
import { SearchPin } from "./PinMarker/SearchPin";
import { BusinessBase } from "@/types/business";
import { BusinessPopUp } from "./BusinessPopUp";
import { useMapView } from "@/hooks/useMapView";
import { toast } from "sonner";
import { ModeToggle } from "../ModeSwitch";
import { Theme } from "../ModeSwitch";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppParams } from "@/hooks/useAppParam";

export const SpotentialMap = () => {
    const isMobile = useIsMobile()
    const { data: analysis, error } = useAnalysisQuery();
    const { lat, lng } = useAppParams();

    // state
    const [selectedBusiness, setSelectedBusiness] = useState<BusinessBase | null>(null);
    const [bizPopupCoords, setBizPopupCoords] = useState<PinLocation | null>(null);
    const [mapTheme, setMapTheme] = useState<Theme>('light');
    const { theme } = useTheme()
    const setDraftPinLocation = useMapStore((state) => state.setDraftPin);
    const draftPinLocation = useMapStore((state) => state.draftPin);
    const canShowAnalysis = useMapStore((state) => state.canShowAnalysis)
    // use a ref to track if we've already shown an error toast for the current error state
    const hasToastedRef = useRef(false);

    // map setup
    const mapRef = useRef<MapRef>(null);
    const initialView = (lat && lng)
        ? { latitude: lat, longitude: lng, zoom: MAP_CONFIG.defaultZoom } // Use search params if they exist
        : MAP_CONFIG.vancouver.center;

    const { flyToLocation } = useMapView(mapRef);

    const onMapLoad = async () => {
        const map = mapRef.current?.getMap();
        if (!map) return;
        if (map.hasImage("business-marker")) return;
        try {
            const response = await map.loadImage("/business-marker.png");
            map.addImage("business-marker", response.data);
        } catch (error) {
            console.error("Failed to load map icon:", error);
        }
    };

    const handleMouseMove = (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];

        const map = mapRef.current?.getMap();
        if (!map) return;

        if (feature?.layer.id === MAP_CONFIG.bizSymbolLayerId) {
            map.getCanvas().style.cursor = "pointer";
        } else {
            map.getCanvas().style.cursor = "";
        }
    };

    const handleSymbolClick = (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (!feature || feature.layer.id !== MAP_CONFIG.bizSymbolLayerId) return false;
        setSelectedBusiness(feature.properties as BusinessBase);
        setBizPopupCoords({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
        });
        return true;
    }

    const handleMapClick = (e: MapLayerMouseEvent) => {
        if (handleSymbolClick(e)) return;
        const { lng, lat } = e.lngLat;
        setBizPopupCoords(null);
        setDraftPinLocation({ lng, lat });
    }

    const handleZoom = (e: ViewStateChangeEvent) => {
        const map = mapRef.current?.getMap();
        if (!map || !selectedBusiness) return;

        const features = map.queryRenderedFeatures({
            layers: [MAP_CONFIG.bizSymbolLayerId],
        });

        const stillVisible = features.some(
            (f) =>
                (f.properties as BusinessBase)?.osm_id ===
                selectedBusiness.osm_id
        );

        if (!stillVisible) {
            setSelectedBusiness(null);
            setBizPopupCoords(null);
        }

    }

    useEffect(() => {
        flyToLocation(lat, lng);
    }, [analysis, lat, lng]);

    useEffect(() => {
        if (error && !hasToastedRef.current) {
            hasToastedRef.current = true;
            toast.error("Failed to analyze location.", {
                description: " Please select a different business or location.",
                classNames: {
                    icon: "text-destructive",
                    description: "!text-primary"
                },
            });
        }

        if (!error) {
            hasToastedRef.current = false;
        }
    }, [error]);

    return (
        <div className="relative w-full h-full">
            <Map
                ref={mapRef}
                initialViewState={initialView}
                style={{ width: "100%", height: "100%" }}
                mapStyle={mapTheme == 'light' ? MAP_CONFIG.mapStyle : MAP_CONFIG.darkMapStyle}
                maxBounds={MAP_CONFIG.vancouver.bounds}
                minZoom={MAP_CONFIG.limits.minZoom}
                maxZoom={MAP_CONFIG.limits.maxZoom}
                onClick={handleMapClick}
                onLoad={onMapLoad}
                onMouseMove={handleMouseMove}
                onMouseDown={() => {
                    setBizPopupCoords(null);
                    setSelectedBusiness(null);
                }}
                onZoom={handleZoom}
                interactiveLayerIds={[MAP_CONFIG.bizSymbolLayerId]}
            >
                {draftPinLocation && (
                    <PinMarker lng={draftPinLocation.lng} lat={draftPinLocation.lat} />
                )}

                {lat && lng && (
                    <SearchPin lng={lng} lat={lat} />
                )}

                {analysis && canShowAnalysis && (
                    <>
                        <TractLayer data={analysis.tract} />
                        <BusinessLayer data={analysis.businesses} />
                    </>
                )}

                {bizPopupCoords && selectedBusiness && (
                    <BusinessPopUp
                        lat={bizPopupCoords.lat}
                        lng={bizPopupCoords.lng}
                        business={selectedBusiness}
                    />
                )}
            </Map>


            <div className={cn("absolute z-10 right-10",
                isMobile ? "top-20" : "top-10"
            )}>
                <ModeToggle
                    currentTheme={mapTheme}
                    onThemeChange={setMapTheme}
                    className="scale-200 dark:data-unchecked:bg-primary"
                    sunIconClassName={cn(
                        "w-2.5 h-2.5",
                        theme === 'dark' && "text-black"
                    )}
                />
            </div>
        </div>
    );
}