/** Marca do Sentinela 360: olho dentro de um anel de 360°, em alto contraste. */
export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`${className} shrink-0`} aria-hidden>
      <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill="#1d1b1a" stroke="rgba(255,255,255,0.16)" />
      {/* anel de 360° com abertura */}
      <circle cx="20" cy="20" r="14" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="70 18" transform="rotate(-125 20 20)" />
      {/* olho */}
      <path d="M8.5 20 Q20 10 31.5 20 Q20 30 8.5 20 Z" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="20" cy="20" r="4.4" fill="#fbbf24" />
      <circle cx="21.6" cy="18.5" r="1.3" fill="#ffffff" />
    </svg>
  )
}

/** Logo completa: marca + nome. */
export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={compacto ? 'size-8' : 'size-9'} />
      <span className="leading-none">
        <span className={`block font-semibold tracking-tight text-white ${compacto ? 'text-[15px]' : 'text-[16.5px]'}`}>
          Sentinela <span className="text-signal">360</span>
        </span>
        <span className="mt-1 block text-[9.5px] font-semibold tracking-[0.24em] text-fg-soft">RIO · TRÂNSITO</span>
      </span>
    </span>
  )
}
