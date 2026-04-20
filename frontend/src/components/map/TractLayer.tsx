import { Source, Layer } from "react-map-gl/maplibre";
import type { LayerProps } from "react-map-gl/maplibre";
import { ExpressionSpecification } from "maplibre-gl";
import type { TractFeature } from "@/types/tract";
import { Feature } from 'geojson';

interface TractLayerProps {
    data: TractFeature;
    id?: string;
    opacity?: number;
}

export const TractLayer = ({
    data,
    id = "selected-tract",
    opacity = 0.4
}: TractLayerProps) => {
    if (!data) return null;

    const scoreColor: ExpressionSpecification = [
        "interpolate",
        ["linear"],
        ["get", "score"],
        0, "#ff0000",
        50, "#d9cf14",
        100, "#08c958"
    ];

    const lineColor: ExpressionSpecification = [
        "interpolate",
        ["linear"],
        ["get", "score"],
        0, "#d80404",
        50, "#9e982c",
        100, "#067a3a"
    ];

    const fillLayer: LayerProps = {
        id: `${id}-fill`,
        type: "fill",
        paint: {
            "fill-color": scoreColor,
            "fill-opacity": opacity,
        },
    };

    const lineLayer: LayerProps = {
        id: `${id}-outline`,
        type: "line",
        paint: {
            "line-color": lineColor,
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