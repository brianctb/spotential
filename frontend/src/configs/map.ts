export const MAP_CONFIG = {
    mapStyle: "https://tiles.openfreemap.org/styles/liberty",
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

    style: "https://tiles.openfreemap.org/styles/liberty",

    bizSymbolLayerId: "business-symbols"
};
