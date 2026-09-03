export function HeroDepthVisual() {
  return (
    <div className="hero-visual-shell" aria-label="Illustrative market depth profile">
      <div className="depth-visual">
        <div className="depth-visual-header">
          <span className="depth-visual-title">Market depth profile</span>
          <span className="depth-visual-status">Illustrative view</span>
        </div>
        <svg
          className="depth-visual-svg"
          viewBox="0 0 640 390"
          role="img"
          aria-labelledby="depth-visual-title depth-visual-description"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="depth-visual-title">Two market depth profiles at the same quoted price</title>
          <desc id="depth-visual-description">
            The deep market keeps more executable volume across the two, five, and ten percent thresholds. The thin market drops sharply near the quoted price.
          </desc>
          <rect width="640" height="390" fill="var(--keel-brand-deep)" />
          <g stroke="oklch(0.82 0.03 285 / 0.16)" strokeWidth="1">
            <path d="M72 58H594" />
            <path d="M72 126H594" />
            <path d="M72 194H594" />
            <path d="M72 262H594" />
            <path d="M72 330H594" />
            <path d="M72 58V330" />
            <path d="M177 58V330" />
            <path d="M282 58V330" />
            <path d="M387 58V330" />
            <path d="M492 58V330" />
            <path d="M594 58V330" />
          </g>
          <g fill="oklch(0.74 0.025 285)" fontFamily="var(--font-jetbrains), monospace" fontSize="11">
            <text x="72" y="354">0%</text>
            <text x="268" y="354">5%</text>
            <text x="554" y="354">10%</text>
            <text x="14" y="64">10m</text>
            <text x="21" y="334">0</text>
          </g>
          <path
            d="M72 90C146 95 185 106 238 120C314 140 360 160 414 185C485 219 536 251 594 277"
            fill="none"
            stroke="oklch(0.79 0.14 168)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M72 90C126 96 158 110 184 143C214 181 221 232 246 283C258 307 276 319 302 324"
            fill="none"
            stroke="oklch(0.8 0.13 83)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <g fill="oklch(0.79 0.14 168)">
            <circle cx="238" cy="120" r="5" />
            <circle cx="414" cy="185" r="5" />
            <circle cx="594" cy="277" r="5" />
          </g>
          <g fill="oklch(0.8 0.13 83)">
            <circle cx="184" cy="143" r="5" />
            <circle cx="246" cy="283" r="5" />
            <circle cx="302" cy="324" r="5" />
          </g>
          <g fill="oklch(0.9 0.018 285)" fontFamily="var(--font-manrope), sans-serif" fontSize="12" fontWeight="700">
            <text x="98" y="76">same quoted price</text>
            <text x="425" y="178">deep market</text>
            <text x="258" y="306">thin market</text>
          </g>
        </svg>
        <div className="depth-visual-footer">
          <div className="depth-visual-legend">
            <span><i className="legend-line legend-line--deep" /> Deep market</span>
            <span><i className="legend-line legend-line--thin" /> Thin market</span>
          </div>
          <span>Executable quote-asset depth</span>
        </div>
      </div>
    </div>
  );
}
