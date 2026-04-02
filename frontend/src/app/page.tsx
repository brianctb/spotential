"use client";

import { SpotentialMap } from "@/components/map/Map";
import { BusinessSidebar } from "@/components/BusinessSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <main className="flex h-screen w-full">
      <BusinessSidebar />
      <SpotentialMap />
    </main>
  );
}