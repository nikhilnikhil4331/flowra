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

/* ------------------------------------------------------------ auth + onboarding */

export function IconArrowRight({ size = 18, className, strokeWidth = 1.9 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </svg>
  );
}

export function IconEye({ size = 18, className, off = false, strokeWidth = 1.6 }: P & { off?: boolean }) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.9" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  );
}

export function IconGoogle({ size = 20, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.6Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.75Z" />
    </svg>
  );
}

export function IconApple({ size = 20, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.9-3.6 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.6.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.1-2.4 1.2-2.4-.1 0-2.2-.9-2.2-3.3ZM14.2 5.9c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 2-.5 2.6-1.2Z" />
    </svg>
  );
}

/* onboarding feature glyphs */
export function IconPulseHeart({ size = 24, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.3 4.9 13a4.6 4.6 0 0 1 6.5-6.5l.6.6.6-.6A4.6 4.6 0 0 1 19.1 13l-1.6 1.6" />
      <path d="M13.2 14.6h2.2l1.3-2.2 1.4 4 1.3-1.8h2.1" />
    </svg>
  );
}

export function IconFoodScan({ size = 24, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5v-2a3 3 0 0 1 3-3h2M15.5 3.5h2a3 3 0 0 1 3 3v2M20.5 15.5v2a3 3 0 0 1-3 3h-2M8.5 20.5h-2a3 3 0 0 1-3-3v-2" />
      <path d="M4.8 12.4h13.9a7 7 0 0 1-7 5.4 7 7 0 0 1-6.9-5.4Z" />
    </svg>
  );
}

export function IconAlarm({ size = 24, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12.6" r="7.6" />
      <path d="M12 9v3.8l2.4 1.4M5 5.2 7 3.4M19 5.2 17 3.4M8.4 20.6 6.7 22.4M15.6 20.6l1.7 1.8" />
    </svg>
  );
}

export function IconSparkline({ size = 24, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.4c1.6 2.4 3.2 4 5.6 4.6-1.6 2.3-2 4.6-1.4 7.3-2.6-.6-4.8 0-6.7 1.7-.6-2.4-2-4.1-4.4-5.4 2.3-1.1 3.7-2.8 4.4-5l.3-1.3Z" />
      <path d="M12.6 17v4M8.4 19.4l1.9 1.6" opacity=".55" />
    </svg>
  );
}

export function IconMoon({ size = 22, className, strokeWidth = 1.7 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.6A8.4 8.4 0 0 1 9.4 4a8.6 8.6 0 1 0 10.6 10.6Z" />
    </svg>
  );
}

export function IconPetals({ size = 22, className, strokeWidth = 1.6 }: P) {
  return (
    <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 11.2c-2.6 0-3.7-1.6-3.7-3.4S9.4 4.4 12 4.4s3.7 1.6 3.7 3.4-1.1 3.4-3.7 3.4Z" />
      <path d="M11.2 12c0 2.6-1.6 3.7-3.4 3.7S4.4 14.6 4.4 12s1.6-3.7 3.4-3.7S11.2 9.4 11.2 12Z" />
      <path d="M12.8 12c0-2.6 1.6-3.7 3.4-3.7S19.6 9.4 19.6 12s-1.6 3.7-3.4 3.7S12.8 14.6 12.8 12Z" />
      <circle cx="12" cy="12.2" r="1.5" />
    </svg>
  );
}
