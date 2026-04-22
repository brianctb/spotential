import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import { FeatureCollection } from "geojson";
import { BusinessCollection } from "@/types/business";
import { MAP_CONFIG } from "@/configs/map";

export const BusinessLayer = ({ data }: { data: BusinessCollection; }) => {
    const symbolLayer: LayerProps = {
        id: MAP_CONFIG.bizSymbolLayerId,
        type: "symbol",
        // Hides pins if they are currently inside a cluster.
        // 'point_count' is injected by MapLibre automatically when points group up.
        filter: ["!", ["has", "point_count"]],
        layout: {
            "icon-image": "business-marker",
            "icon-size": 0.35,
            // Force show all pins; prevents map labels/other pins from hiding them.
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "text-field": ["get", "name"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
            "text-size": 12,
        },
        paint: {
            "text-color": "#333333",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1
        }
    };

    const clusterLayer: LayerProps = {
        id: "clusters",
        type: "circle",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": "#51bbd6",
            // step logic: [default_radius, threshold, new_radius, threshold, new_radius]
            "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
            "circle-opacity": 0.8
        }
    };

    const clusterCountLayer: LayerProps = {
        id: "cluster-count",
        type: "symbol",
        filter: ["has", "point_count"],
        layout: {
            // Internal shorthand for the group total (e.g., 1.5k).
            "text-field": "{point_count_abbreviated}",
            "text-size": 12
        }
    };

    return (
        <Source
            id="businesses"
            type="geojson"
            data={data as FeatureCollection}
            cluster={true}
            // Higher = stay clustered longer. Lower = pins appear sooner.
            clusterMaxZoom={MAP_CONFIG.limits.maxZoom - 5}
            clusterRadius={50}
        >
            {/* Order matters: Bottom layer first */}
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...symbolLayer} />
        </Source>
    );
};