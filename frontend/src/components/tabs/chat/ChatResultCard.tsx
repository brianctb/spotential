"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCommitLocation } from "@/hooks/useCommitLocation";
import type { AgentLocationResult } from "@/types/agent";

const formatLocation = (result: AgentLocationResult) =>
  [result.neighbourhood, result.city, result.state, result.country]
    .filter(Boolean)
    .join(", ");

export const ChatResultCard = ({ result }: { result: AgentLocationResult }) => {
  const commitLocation = useCommitLocation();
  const [open, setOpen] = useState(false);
  const location = formatLocation(result);

  return (
    <Card size="sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium">{result.label}</span>
            <span className="ml-auto text-muted-foreground">
              Score {Math.round(result.score)}
            </span>
          </div>

          {location && (
            <p className="pl-6 text-xs text-muted-foreground">{location}</p>
          )}

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-1 self-start pl-6 text-xs text-muted-foreground hover:text-foreground"
            >
              {open ? "Hide details" : "More details"}
              <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent className="flex flex-col gap-0.5 pl-6 pt-1 text-xs text-muted-foreground">
            <span>Predicted count: {result.predicted_count.toFixed(1)}</span>
            <span>Actual count: {result.actual_count}</span>
            <span>Tract ID: {result.tract_id}</span>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>

      <CardFooter>
        <Button
          size="sm"
          variant="secondary"
          className="w-full hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
          onClick={() =>
            commitLocation(result.business_type, result.lat, result.lng)
          }
        >
          View on map
        </Button>
      </CardFooter>
    </Card>
  );
};
