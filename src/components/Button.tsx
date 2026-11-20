import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'confirmar' | 'descartar' | 'neutro' | 'fantasma'

const estilos: Record<Variante, string> = {
  primario: 'bg-white text-[#141416] hover:bg-white/90 shadow-[0_10px_26px_-12px_rgba(255,255,255,0.45)]',
  confirmar: 'bg-white text-[#141416] hover:bg-white/90 shadow-[0_10px_26px_-12px_rgba(255,255,255,0.45)]',
  descartar: 'bg-white/[0.08] text-fg ring-1 ring-inset ring-white/15 hover:bg-white/[0.14]',
  neutro: 'bg-white/[0.07] text-fg ring-1 ring-inset ring-line hover:bg-white/[0.12]',
  fantasma: 'text-fg-soft hover:bg-white/[0.06] hover:text-fg',
}

export function Button({
  variante = 'neutro',
  tamanho = 'md',
  icone,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamanho?: 'sm' | 'md' | 'lg'
  icone?: ReactNode
}) {
  const t = tamanho === 'sm' ? 'h-9 px-3 text-[13px] gap-1.5' : tamanho === 'lg' ? 'h-12 px-5 text-[15px] gap-2' : 'h-10 px-4 text-sm gap-2'
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 disabled:pointer-events-none disabled:opacity-35 ${t} ${estilos[variante]} ${className}`}
    >
      {icone}
      {children}
    </button>
  )
}
