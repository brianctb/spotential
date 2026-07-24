"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCommitLocation } from "@/hooks/useCommitLocation";
import type { AgentLocationResult } from "@/types/agent";

export const ChatResultCard = ({ result }: { result: AgentLocationResult }) => {
  const commitLocation = useCommitLocation();

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-2 text-sm">
        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-medium">{result.label}</span>
        <span className="text-muted-foreground">Score {Math.round(result.score)}</span>
      </CardContent>
      <CardFooter>
        <Button
          size="sm"
          variant="secondary"
          className="w-full hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
          onClick={() => commitLocation(result.business_type, result.lat, result.lng)}
        >
          View on map
        </Button>
      </CardFooter>
    </Card>
  );
};
