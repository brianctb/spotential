import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface SearchPinSonarProps {
    isActive: boolean;
    onAnimationComplete?: () => void;
    className?: string
}

export const SearchPinSonar = ({ isActive, onAnimationComplete, className }: SearchPinSonarProps) => {

    const [render, setRender] = useState(false);

    useEffect(() => {
        if (isActive) {
            setRender(true);
        } else if (render) {
            // Updated to 3000ms as requested, but make sure 
            const timer = setTimeout(() => {
                setRender(false);
                onAnimationComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isActive, render, onAnimationComplete]);

    if (!render) return null;

    const baseRing = cn(
        "absolute rounded-full border border-blue-500",
        isActive ? "animate-sonar" : "animate-sonar-rev",
        className
    );

    return (
        <>
            <span className={cn(baseRing, "w-10 h-10")} />
            <span className={cn(
                baseRing,
                "w-8 h-8 [animation-delay:0.4s]"
            )} />
            <span className={cn(
                baseRing,
                "w-6 h-6 [animation-delay:0.8s]"
            )} />
        </>
    );
};