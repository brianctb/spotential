"use client";

import { useState, useEffect } from 'react';
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
    const [render, setRender] = useState(false);
    const [zoom, setZoom] = useState(MAP_CONFIG.defaultZoom);

    // use the map's zoom level to dynamically scale ring
    useEffect(() => {
        const map = mapInstance?.getMap();
        if (!map) return;
        setZoom(map.getZoom());
        const onMove = () => setZoom(map.getZoom());
        map.on("move", onMove);

        return () => {
            map.off("move", onMove);
        };
    }, [mapInstance]);

    useEffect(() => {
        if (isActive) {
            setRender(true);
        } else if (render) {
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