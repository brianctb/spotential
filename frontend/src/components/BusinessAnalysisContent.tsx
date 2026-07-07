import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "./ui/tabs"
import { BusinessCategoryAccordion } from "./tabs/BusinessCategoryAccordion";
import { DemographicsAccordion } from "./tabs/DemographicsAccordion";
import { ChatTab } from "./tabs/ChatTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { Store, Users, MessageCircle } from "lucide-react";

export const BusinessAnalysisContent = () => {
    const businessTabId = "businessTypes";
    const demographicsTabId = "demographics";
    const chatTabId = "chat";

    const isMobile = useIsMobile()

    return (
        <Tabs defaultValue={businessTabId} className="w-full px-2">
            <TabsList variant="default" className="w-full">
                <TabsTrigger value={businessTabId}>
                    <Store />
                    Business Types
                </TabsTrigger>
                <TabsTrigger value={demographicsTabId}>
                    <Users />
                    Demographics
                </TabsTrigger>
                {isMobile && (
                    <TabsTrigger value={chatTabId}>
                        <MessageCircle />
                        Chat
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value={businessTabId}>
                <BusinessCategoryAccordion showButton={!isMobile} />
            </TabsContent>

            <TabsContent value={demographicsTabId}>
                <DemographicsAccordion />
            </TabsContent>

            {isMobile && (
                <TabsContent value={chatTabId}>
                    <ChatTab />
                </TabsContent>
            )}
        </Tabs>
    )

}
