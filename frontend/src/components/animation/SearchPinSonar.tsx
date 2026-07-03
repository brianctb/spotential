"use client";

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useMap } from "react-map-gl/maplibre"; // Or 'react-map-gl'
import { cn } from "@/lib/utils";
import { MAP_CONFIG } from '@/configs/map';

interface SearchPinSonarProps {
    isActive: boolean;
    onAnimationComplete?: () => void;
    className?: string
}

export const SearchPinSonar = ({ isActive, onAnimationComplete, className }: SearchPinSonarProps) => {
    const { current: mapInstance } = useMap();
    const [render, setRender] = useState(isActive);

    // use the map's zoom level to dynamically scale ring
    const zoom = useSyncExternalStore(
        (onChange) => {
            const map = mapInstance?.getMap();
            if (!map) return () => {};
            // maplibre calls onChange on every "move" event, which tells React
            // to re-run getSnapshot below and re-render if the zoom changed
            map.on("move", onChange);
            return () => map.off("move", onChange);
        },
        () => mapInstance?.getMap()?.getZoom() ?? MAP_CONFIG.defaultZoom, // getSnapshot: current zoom, read on demand
        () => MAP_CONFIG.defaultZoom, // getServerSnapshot: fallback used during SSR
    );

    // turning on: reflect the prop change immediately (no effect needed)
    if (isActive && !render) {
        setRender(true);
    }

    // turning off: keep rendering for the reverse animation, then unmount
    useEffect(() => {
        if (!isActive && render) {
            const timer = setTimeout(() => {
                setRender(false);
                onAnimationComplete?.();
                // this time must match the sonar reverse animation time
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isActive, render, onAnimationComplete]);

    if (!render) return null;

    const baseZoom = MAP_CONFIG.defaultZoom;
    const scaleFactor = Math.pow(1.2, zoom - baseZoom);

    const baseRing = cn(
        "absolute rounded-full border border-blue-500",
        isActive ? "animate-sonar" : "animate-sonar-rev",
        className
    );

    const sizes = {
        large: 80 * scaleFactor,
        medium: 60 * scaleFactor,
        small: 40 * scaleFactor,
    };

    return (
        <>
            <span
                className={baseRing}
                style={{ width: `${sizes.large}px`, height: `${sizes.large}px` }}
            />
            {/* the delay should only happen when it is active */}
            {/* removing the delay when collapsing, otherwise, these rings will stay in place for x delay while outter ring collapse first */}
            <span
                className={cn(baseRing, isActive && "[animation-delay:0.4s]")}
                style={{ width: `${sizes.medium}px`, height: `${sizes.medium}px` }}
            />
            <span
                className={cn(baseRing, isActive && "[animation-delay:0.8s]")}
                style={{ width: `${sizes.small}px`, height: `${sizes.small}px` }}
            />
        </>
    );
};