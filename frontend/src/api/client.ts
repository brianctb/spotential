const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
    get: async <T>(
        path: string,
        params?: Record<string, string | number | boolean | undefined>
    ): Promise<T> => {
        const url = new URL(`${BASE_URL}${path}`);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    },
};