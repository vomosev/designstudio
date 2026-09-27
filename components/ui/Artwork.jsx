/**
 * Artwork — deterministic gradient + inline SVG pattern tile.
 *
 * Used everywhere a project photograph would normally sit. It never loads a
 * remote image, so it can never 404 and never reflows: the box reserves its
 * space through aspect-ratio before anything renders.
 */

const RATIOS = {
  '4/3': '4 / 3',
  '3/2': '3 / 2',
  '16/9': '16 / 9',
  '1/1': '1 / 1',
  '21/9': '21 / 9',
};

function normaliseHue(value, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const wrapped = numeric % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Tiny deterministic hash so the same hue always draws the same pattern. */
function hashFrom(hue, hueEnd, label) {
  const seed = `${hue}-${hueEnd}-${label || ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100003;
  }
  return hash;
}

export default function Artwork({
  hue = 12,
  hueEnd,
  label = 'Abstract gradient artwork',
  ratio = '4/3',
  className = '',
}) {
  const start = normaliseHue(hue, 12);
  const end = normaliseHue(hueEnd, (start + 48) % 360);
  const hash = hashFrom(start, end, label);
  const variant = hash % 4;
  const drift = (hash % 17) - 8;

  const aspect = RATIOS[ratio] || RATIOS['4/3'];

  const style = {
    aspectRatio: aspect,
    backgroundImage: [
      `radial-gradient(120% 120% at ${18 + (hash % 40)}% ${12 + (hash % 30)}%, hsl(${start} 78% 62% / 0.92) 0%, hsl(${start} 70% 44% / 0.6) 42%, transparent 72%)`,
      `linear-gradient(${125 + drift}deg, hsl(${start} 64% 34%) 0%, hsl(${(start + end) / 2} 58% 26%) 48%, hsl(${end} 66% 38%) 100%)`,
    ].join(', '),
  };

  const stroke = `hsl(${end} 92% 88% / 0.55)`;
  const strokeSoft = `hsl(${start} 92% 92% / 0.28)`;
  const fillSoft = `hsl(${end} 90% 86% / 0.16)`;

  return (
    <div
      className={`artwork${className ? ` ${className}` : ''}`}
      style={style}
      role="img"
      aria-label={label}
    >
      <svg
        className="artwork__pattern"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {variant === 0 && (
          <g fill="none" stroke={stroke} strokeWidth="1.5">
            <polygon points="200,46 318,254 82,254" fill={fillSoft} />
            <polygon points="200,96 272,226 128,226" stroke={strokeSoft} />
            <line x1="200" y1="46" x2="200" y2="254" stroke={strokeSoft} />
            <circle cx="200" cy="184" r="42" stroke={strokeSoft} />
          </g>
        )}

        {variant === 1 && (
          <g fill="none" stroke={stroke} strokeWidth="1.5">
            <circle cx="132" cy="150" r="86" fill={fillSoft} />
            <circle cx="248" cy="150" r="86" stroke={strokeSoft} />
            <circle cx="190" cy="150" r="34" />
            <line x1="40" y1="238" x2="360" y2="238" stroke={strokeSoft} />
            <line x1="40" y1="62" x2="360" y2="62" stroke={strokeSoft} />
          </g>
        )}

        {variant === 2 && (
          <g fill="none" stroke={stroke} strokeWidth="1.5">
            <rect x="58" y="52" width="140" height="196" rx="10" fill={fillSoft} />
            <rect x="214" y="92" width="128" height="116" rx="10" stroke={strokeSoft} />
            <line x1="58" y1="150" x2="342" y2="150" stroke={strokeSoft} />
            <circle cx="278" cy="150" r="26" />
          </g>
        )}

        {variant === 3 && (
          <g fill="none" stroke={stroke} strokeWidth="1.5">
            <path d="M20 232 C110 120, 190 260, 290 108" strokeWidth="2" />
            <path d="M20 268 C120 170, 210 290, 380 150" stroke={strokeSoft} />
            <polygon points="300,74 356,168 244,168" fill={fillSoft} stroke={strokeSoft} />
            <circle cx="96" cy="94" r="30" stroke={strokeSoft} />
          </g>
        )}

        <g aria-hidden="true">
          <rect x="0" y="0" width="400" height="300" fill="none" stroke={strokeSoft} strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}