import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { BusinessCategoryAccordion } from "./tabs/BusinessCategoryAccordion";
import { DemographicsAccordion } from "./tabs/DemographicsAccordion";
import { ChatTab } from "./tabs/ChatTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { Store, Users, MessageCircle } from "lucide-react";

export const BUSINESS_TYPES_TAB = "businessTypes";
export const DEMOGRAPHICS_TAB = "demographics";
export const CHAT_TAB = "chat";

export const BusinessTabsList = () => {
  const isMobile = useIsMobile();

  return (
    <TabsList variant="default" className="w-full">
      <TabsTrigger value={BUSINESS_TYPES_TAB}>
        <Store />
        Business Types
      </TabsTrigger>
      <TabsTrigger value={DEMOGRAPHICS_TAB}>
        <Users />
        Demographics
      </TabsTrigger>
      {isMobile && (
        <TabsTrigger value={CHAT_TAB}>
          <MessageCircle />
          Chat
        </TabsTrigger>
      )}
    </TabsList>
  );
};

export const BusinessTabsContent = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-1 flex-col pt-3">
      <TabsContent value={BUSINESS_TYPES_TAB}>
        <BusinessCategoryAccordion showButton={!isMobile} />
      </TabsContent>

      <TabsContent value={DEMOGRAPHICS_TAB}>
        <DemographicsAccordion />
      </TabsContent>

      {isMobile && (
        <TabsContent value={CHAT_TAB}>
          <ChatTab />
        </TabsContent>
      )}
    </div>
  );
};

export const BusinessAnalysisContent = () => (
  <Tabs defaultValue={BUSINESS_TYPES_TAB} className="w-full px-2">
    <BusinessTabsList />
    <BusinessTabsContent />
  </Tabs>
);
