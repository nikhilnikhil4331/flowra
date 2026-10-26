/** Small SVG icon set — matched to the reference's 1.6px outlined glyphs. */

type P = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
});

export function IconHome({ size = 22, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
      <path d="M3.4 10.4 12 3.6l8.6 6.8V19a1.4 1.4 0 0 1-1.4 1.4h-4.3v-5.2H9.1v5.2H4.8A1.4 1.4 0 0 1 3.4 19z" />
    </svg>
  );
}

export function IconCalendar({ size = 22, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.2" y="5" width="17.6" height="15.4" rx="3.2" />
      <path d="M8 3.2v3.4M16 3.2v3.4M3.2 10h17.6" />
      <path d="M8 13.6h.01M12 13.6h.01M16 13.6h.01M8 17.2h.01M12 17.2h.01" strokeWidth={strokeWidth + 0.6} />
    </svg>
  );
}

export function IconLeaf({ size = 22, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 8.2-4 12.4-10.4 12.4H6.2C6.2 9.2 11 4 20 4Z" />
      <path d="M3.4 21c1.8-4.4 5-8.2 9.4-10.6" />
    </svg>
  );
}

export function IconMenu({ size = 22, className, strokeWidth = 1.9 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M2 5h20M2 12h20M2 19h20" />
    </svg>
  );
}

export function IconBell({ size = 17, className, strokeWidth = 1.6 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8.6a6 6 0 0 0-12 0c0 5.2-1.8 6.6-1.8 6.6h15.6S18 13.8 18 8.6Z" />
      <path d="M10.4 18.6a1.9 1.9 0 0 0 3.2 0" />
    </svg>
  );
}

export function IconArrowLeft({ size = 18, className, strokeWidth = 1.8 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6 5 12l6 6" />
    </svg>
  );
}

export function IconChevronLeft({ size = 18, className, strokeWidth = 1.9 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function IconChevronRight({ size = 18, className, strokeWidth = 1.9 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconPlus({ size = 20, className, strokeWidth = 2 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconCheck({ size = 18, className, strokeWidth = 2.2 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 10 17.5 19 7" />
    </svg>
  );
}

export function IconDrop({ size = 18, className }: P & { fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2.6c3.6 4.3 6.4 7.9 6.4 11.1A6.4 6.4 0 0 1 12 20.1a6.4 6.4 0 0 1-6.4-6.4c0-3.2 2.8-6.8 6.4-11.1Z" fill="url(#dropGrad)" stroke="#2b2233" strokeWidth="1.3" />
      <defs>
        <linearGradient id="dropGrad" x1="12" y1="4" x2="12" y2="20">
          <stop stopColor="#fff" />
          <stop offset=".45" stopColor="#ff9ab5" />
          <stop offset="1" stopColor="#f8306b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconPencil({ size = 17, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.4 3.9a2.1 2.1 0 0 1 3 3l-9.9 9.9-4.2 1.2 1.2-4.2 9.9-9.9Z" />
      <path d="m14.6 5.7 3 3" />
    </svg>
  );
}

export function IconClose({ size = 16, className, strokeWidth = 2 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconTrash({ size = 16, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 6.5h15M9.5 6.5V4.6h5v1.9M6.6 6.5l.9 13h9l.9-13" />
    </svg>
  );
}

export function IconSparkle({ size = 16, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2.4l1.6 5.6L19 9.6l-5.4 1.6L12 16.8l-1.6-5.6L5 9.6l5.4-1.6L12 2.4Z" fill="#ffb8cd" />
      <path d="M18.6 15.2l.8 2.6 2.6.8-2.6.8-.8 2.6-.8-2.6-2.6-.8 2.6-.8.8-2.6Z" fill="#ffd0b8" />
    </svg>
  );
}

/** ambient flower used next to the greeting */
export function FlowerGlyph({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx="12"
            cy="6.4"
            rx="3.05"
            ry="4.5"
            fill="#ffa9c0"
            stroke="#ff6f95"
            strokeWidth="0.8"
            transform={`rotate(${i * 72} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="2.5" fill="#ffd9a8" stroke="#ffb45f" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

export function StatusBar({ time = '09:41' }: { time?: string }) {
  return (
    <div className="statusbar">
      <span className="statusbar__time">{time}</span>
      <span className="statusbar__icons" aria-hidden="true">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7.6" width="3.1" height="4.4" rx="1" />
          <rect x="4.6" y="5.4" width="3.1" height="6.6" rx="1" />
          <rect x="9.2" y="2.8" width="3.1" height="9.2" rx="1" />
          <rect x="13.8" y="0.4" width="3.1" height="11.6" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M1.4 4.1a11 11 0 0 1 14.2 0" />
          <path d="M4.1 7a7 7 0 0 1 8.8 0" />
          <circle cx="8.5" cy="10" r="1.15" fill="currentColor" stroke="none" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.7" y="0.7" width="21.6" height="10.6" rx="3.2" stroke="currentColor" strokeWidth="1.3" />
          <rect x="2.4" y="2.4" width="16.4" height="7.2" rx="2" fill="currentColor" />
          <path d="M24 4.2v3.6a2.4 2.4 0 0 0 0-3.6Z" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}
