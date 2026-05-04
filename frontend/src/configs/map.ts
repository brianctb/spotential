export const MAP_CONFIG = {
    mapStyle: "https://tiles.openfreemap.org/styles/liberty",
    // Dark mode option (currently unused, but can be switched to for a different aesthetic)
    darkMapStyle: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    vancouver: {
        bounds: [
            [-123.30, 49.10],
            [-122.75, 49.38],
        ] as [[number, number], [number, number]],


        center: {
            longitude: -123.1207,
            latitude: 49.2827,
            zoom: 13,
        },
    },

    limits: {
        minZoom: 10,
        maxZoom: 19,
    },

    defaultZoom: 14,
    bizSymbolLayerId: "business-symbols"
};
