"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
    const queryClientRef = useRef(new QueryClient());
    const queryClient = queryClientRef.current;

    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </QueryClientProvider>
    );
}