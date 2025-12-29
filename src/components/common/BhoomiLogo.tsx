interface BhoomiLogoProps {
  size?: number;
  animate?: boolean;
  rotationDuration?: number;
}

export function BhoomiLogo({
  size = 40,
  animate = false,
  rotationDuration = 18,
}: BhoomiLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Bhoomi Cloud"
    >
      {animate && (
        <style>
          {`
            .bhoomi-rotate {
              transform-origin: 50% 50%;
              animation: bhoomi-spin ${rotationDuration}s linear infinite;
            }

            @keyframes bhoomi-spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      )}

      <defs>
        {/* Indian flag gradient */}
        <linearGradient id="indiaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#138808" />
        </linearGradient>

        {/* Globe lighting */}
        <radialGradient id="globeLight" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="70%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </radialGradient>

        {/* Grid fade mask */}
        <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="white" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <mask id="gridMask">
          <rect width="100%" height="100%" fill="url(#gridFade)" />
        </mask>
      </defs>

      <g className={animate ? 'bhoomi-rotate' : undefined}>
        {/* Base globe */}
        <circle cx="160" cy="160" r="120" fill="url(#indiaGradient)" />

        {/* Grid lines */}
        <g
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="2"
          fill="none"
          mask="url(#gridMask)"
          vectorEffect="non-scaling-stroke"
        >
          {/* Latitudes */}
          <ellipse cx="160" cy="160" rx="100" ry="40" />
          <ellipse cx="160" cy="160" rx="100" ry="70" />
          <ellipse cx="160" cy="160" rx="100" ry="100" />

          {/* Longitudes */}
          <ellipse cx="160" cy="160" rx="40" ry="100" />
          <ellipse cx="160" cy="160" rx="70" ry="100" />
        </g>

        {/* Ashoka Chakra */}
        <g
          transform="translate(160 160)"
          stroke="#000080"
          strokeWidth="2"
          fill="none"
        >
          <circle r="26" />

          {/* 24 spokes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} y1="-26" y2="26" transform={`rotate(${i * 15})`} />
          ))}
        </g>

        {/* Lighting overlay */}
        <circle cx="160" cy="160" r="120" fill="url(#globeLight)" />
      </g>
    </svg>
  );
}
