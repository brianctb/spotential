"use client";

import { useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChatTab } from "@/components/tabs/ChatTab";

export const ChatSidePanel = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-lg transition-transform duration-300 ease-in-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between border-b border-border/60 p-4">
                    <h2 className="flex items-center gap-2 font-heading text-base font-medium">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Ask Spotential
                    </h2>
                    <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                    <ChatTab />
                </div>
            </div>

            {!open && (
                <Button
                    size="icon-lg"
                    className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
                    onClick={() => setOpen(true)}
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
            )}
        </>
    );
};
