const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

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
            throw new ApiError(response.status, await response.text());
        }
        return response.json();
    },

    post: async <T>(path: string, body: unknown): Promise<T> => {
        const url = new URL(`${BASE_URL}${path}`);

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new ApiError(response.status, await response.text());
        }
        return response.json();
    },
};