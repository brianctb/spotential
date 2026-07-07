"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";

export const ChatTab = () => {
    const [input, setInput] = useState("");

    return (
        <div className="flex flex-col gap-3 pb-4">
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a business idea..."
                    className="border-transparent bg-card ring-1 ring-foreground/10"
                />
                <Button size="icon" disabled>
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            <Separator className="opacity-50" />

            <p className="text-sm text-muted-foreground text-center pt-4">
                Chat coming soon.
            </p>
        </div>
    );
};
