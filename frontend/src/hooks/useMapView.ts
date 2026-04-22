import type {
    MapRef

} from "react-map-gl/maplibre";

export const useMapView = (mapRef: React.RefObject<MapRef | null>) => {
    const flyToLocation = (lat: number, lng: number, zoom: number = 14) => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        map.flyTo({
            center: [lng, lat],
            zoom,
            speed: 0.7,
            curve: 1.5,
            essential: true,
        });
    };

    return { flyToLocation };
}
