export const SpotentialLogo = ({ className = "w-7 h-7" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect x="0" y="0" width="100" height="100" rx="22" fill="#007AFF" />
            <path
                d="M50 86C50 86 78 61.5 78 43C78 27.54 65.46 15 50 15C34.54 15 22 27.54 22 43C22 61.5 50 86 50 86Z"
                fill="white"
            />

            {/* Outer Ring */}
            <circle cx="50" cy="43" r="16" stroke="#007AFF" strokeWidth="2.8" />
            {/* Middle Ring */}
            <circle cx="50" cy="43" r="10" stroke="#007AFF" strokeWidth="2.8" />
            {/* Center Dot */}
            <circle cx="50" cy="43" r="4" fill="#007AFF" />
        </svg>
    );
};