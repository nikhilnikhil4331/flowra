import { BatteryFull, Signal, Wifi } from 'lucide-react'

/** Small, CSS-drawn artwork keeps the app lightweight and avoids remote image requests. */
export function Chibi({ mood = 'calm', size = 'sm', className = '' }: { mood?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span className={`chibi chibi--${mood} chibi--${size} ${className}`} aria-hidden="true">
      <i className="chibi__hair" />
      <i className="chibi__face"><b className="chibi__eye chibi__eye--left" /><b className="chibi__eye chibi__eye--right" /><b className="chibi__mouth" /></i>
      <i className="chibi__body" />
    </span>
  )
}

export function Blossom({ className = '' }: { className?: string }) {
  return <span className={`blossom ${className}`} aria-hidden="true"><i /><i /><i /><i /><b /></span>
}

export function FloralLineArt({ position = 'top-right' }: { position?: 'top-right' | 'bottom-left' | 'bottom-right' }) {
  return <span className={`floral-line-art floral-line-art--${position}`} aria-hidden="true"><i /><i /><i /><i /></span>
}

export function MobileStatusBar() {
  // Fixed reference chrome keeps every Myflo screen aligned with the supplied UI specification.
  const time = '09:41'
  return <div className="mobile-statusbar" aria-hidden="true"><strong>{time}</strong><span><Signal size={15} fill="currentColor" /><Wifi size={15} /><BatteryFull size={18} fill="currentColor" /></span></div>
}
