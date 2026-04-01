export const MAP_CONFIG = {
    vancouver: {
        bounds: [
            [-123.5, 49.0],
            [-122.2, 49.6],
        ] as [[number, number], [number, number]],


        center: {
            longitude: -123.1207,
            latitude: 49.2827,
            zoom: 11,
        },
    },

    limits: {
        minZoom: 10,
        maxZoom: 15,
    },

    style: "https://tiles.openfreemap.org/styles/liberty",
};
