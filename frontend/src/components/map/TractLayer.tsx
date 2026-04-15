import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import type { CensusFeature } from "@/types/census";
import { Feature } from 'geojson';

interface TractLayerProps {
    data: CensusFeature;
    id?: string;
    color?: string;
    opacity?: number;
}

export const TractLayer = ({
    data,
    id = "selected-tract",
    color = "#0c9f20",
    opacity = 0.25
}: TractLayerProps) => {
    if (!data) return null;

    const fillLayer: LayerProps = {
        id: `${id}-fill`,
        type: "fill",
        paint: {
            "fill-color": color,
            "fill-opacity": opacity,
        },
    };

    const lineLayer: LayerProps = {
        id: `${id}-outline`,
        type: "line",
        paint: {
            "line-color": color,
            "line-width": 2,
        },
    };

    return (
        <Source id={id} type="geojson" data={data as Feature}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
        </Source>
    );
};