const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = {
    get: async <T>(path: string): Promise<T> => {
        const response = await fetch(`${BASE_URL}${path}`, {
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
}