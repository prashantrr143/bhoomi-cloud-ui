// SVG logo as a data URL for use in image src attributes
const svgString = `<svg width="40" height="40" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="indiaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF9933"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#138808"/>
    </linearGradient>
    <radialGradient id="globeLight" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
      <stop offset="70%" stop-color="rgba(255,255,255,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
    </radialGradient>
    <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="white"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <mask id="gridMask">
      <rect width="100%" height="100%" fill="url(#gridFade)"/>
    </mask>
  </defs>
  <g>
    <circle cx="160" cy="160" r="120" fill="url(#indiaGradient)"/>
    <g stroke="rgba(0,0,0,0.18)" stroke-width="2" fill="none" mask="url(#gridMask)">
      <ellipse cx="160" cy="160" rx="100" ry="40"/>
      <ellipse cx="160" cy="160" rx="100" ry="70"/>
      <ellipse cx="160" cy="160" rx="100" ry="100"/>
      <ellipse cx="160" cy="160" rx="40" ry="100"/>
      <ellipse cx="160" cy="160" rx="70" ry="100"/>
    </g>
    <g transform="translate(160 160)" stroke="#000080" stroke-width="2" fill="none">
      <circle r="26"/>
      <line y1="-26" y2="26"/>
      <line y1="-26" y2="26" transform="rotate(15)"/>
      <line y1="-26" y2="26" transform="rotate(30)"/>
      <line y1="-26" y2="26" transform="rotate(45)"/>
      <line y1="-26" y2="26" transform="rotate(60)"/>
      <line y1="-26" y2="26" transform="rotate(75)"/>
      <line y1="-26" y2="26" transform="rotate(90)"/>
      <line y1="-26" y2="26" transform="rotate(105)"/>
      <line y1="-26" y2="26" transform="rotate(120)"/>
      <line y1="-26" y2="26" transform="rotate(135)"/>
      <line y1="-26" y2="26" transform="rotate(150)"/>
      <line y1="-26" y2="26" transform="rotate(165)"/>
    </g>
    <circle cx="160" cy="160" r="120" fill="url(#globeLight)"/>
  </g>
</svg>`;

export const bhoomiLogoDataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
