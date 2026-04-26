interface BottomAnchorProps {
    children: React.ReactNode;
    className?: string;
}

export const BottomCenteredContainer = ({ children, className = "" }: BottomAnchorProps) => {
    return (
        <div
            className={`absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 pointer-events-none 
                flex items-center justify-center
                ${className}`}
        >
            {children}
        </div>
    );
};