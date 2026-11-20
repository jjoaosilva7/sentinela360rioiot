import { FileX, Grid2x2X, Smartphone, Truck } from 'lucide-react'
import { formatarConfianca } from '../lib/format'
import { STATUS_LABEL, TIPO_LABEL, type Status, type Tipo } from '../types'

const statusCor: Record<Status, string> = {
  novo: 'text-novo',
  confirmado: 'text-confirmado',
  descartado: 'text-descartado',
}

export function StatusBadge({ status, className = '' }: { status: Status; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2 py-0.5 text-[10.5px] font-medium ring-1 ring-inset ring-white/[0.08] ${statusCor[status]} ${className}`}
    >
      <span className="relative flex size-1.5">
        {status === 'novo' && <span className="animate-ping-soft absolute inset-0 rounded-full bg-current" />}
        <span className="relative size-1.5 rounded-full bg-current" />
      </span>
      <span className="text-fg/90">{STATUS_LABEL[status]}</span>
    </span>
  )
}

export const tipoCor: Record<Tipo, { texto: string; fundo: string; hex: string; gradiente: string }> = {
  bloqueio_cruzamento: {
    texto: 'text-bloqueio',
    fundo: 'bg-bloqueio/12 ring-bloqueio/30',
    hex: '#fb923c',
    gradiente: 'linear-gradient(145deg,#ffd27a 0%,#f7a12b 55%,#c86a0e 100%)',
  },
  celular: {
    texto: 'text-celular',
    fundo: 'bg-celular/12 ring-celular/30',
    hex: '#a78bfa',
    gradiente: 'linear-gradient(145deg,#d4c4ff 0%,#9b7bf7 55%,#5d3fc4 100%)',
  },
  cinto: {
    texto: 'text-cinto',
    fundo: 'bg-cinto/12 ring-cinto/30',
    hex: '#2dd4bf',
    gradiente: 'linear-gradient(145deg,#9ff3e6 0%,#2cc7b2 55%,#0f7f72 100%)',
  },
  caminhao_esquerda: {
    texto: 'text-caminhao',
    fundo: 'bg-caminhao/12 ring-caminhao/30',
    hex: '#60a5fa',
    gradiente: 'linear-gradient(145deg,#bcdcff 0%,#4f97f5 55%,#1f56b8 100%)',
  },
  nao_licenciado: {
    texto: 'text-licenciamento',
    fundo: 'bg-licenciamento/12 ring-licenciamento/30',
    hex: '#f472b6',
    gradiente: 'linear-gradient(145deg,#ffc6e4 0%,#ee5fa8 55%,#a8246b 100%)',
  },
}

/** Ícone de pessoa com a faixa diagonal do cinto (no mesmo traço dos ícones lucide). */
export function IconeCinto({ className = 'size-4', strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="5" r="2.6" />
      <path d="M5.5 21v-6.5a6.5 6.5 0 0 1 13 0V21" />
      <path d="M7.5 9.8 17 20.5" />
    </svg>
  )
}

export function TipoIcone({ tipo, className = 'size-4' }: { tipo: Tipo; className?: string }) {
  switch (tipo) {
    case 'bloqueio_cruzamento':
      return <Grid2x2X className={className} strokeWidth={2.1} />
    case 'celular':
      return <Smartphone className={className} strokeWidth={2.1} />
    case 'cinto':
      return <IconeCinto className={className} strokeWidth={2.1} />
    case 'caminhao_esquerda':
      return <Truck className={className} strokeWidth={2.1} />
    case 'nao_licenciado':
      return <FileX className={className} strokeWidth={2.1} />
  }
}

/** Ícone com acabamento "vidro brilhante", inspirado nos tiles do layout de referência. */
export function GlossyTile({
  gradiente,
  children,
  tamanho = 'md',
  brilho,
}: {
  gradiente: string
  children: React.ReactNode
  tamanho?: 'sm' | 'md' | 'lg'
  /** cor do halo projetado abaixo do ícone */
  brilho?: string
}) {
  const box = tamanho === 'sm' ? 'size-9 rounded-xl' : tamanho === 'lg' ? 'size-16 rounded-[20px]' : 'size-12 rounded-2xl'
  return (
    <span
      className={`${box} relative grid shrink-0 place-items-center overflow-hidden text-white`}
      style={{
        background: gradiente,
        boxShadow: `0 14px 30px -10px ${brilho ?? 'rgba(0,0,0,0.6)'}, inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -6px 14px rgba(0,0,0,0.18)`,
      }}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
      <span className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{children}</span>
    </span>
  )
}

export function TipoTile({ tipo, tamanho = 'md' }: { tipo: Tipo; tamanho?: 'sm' | 'md' | 'lg' }) {
  const icone = tamanho === 'lg' ? 'size-7' : tamanho === 'sm' ? 'size-4' : 'size-5'
  return (
    <GlossyTile gradiente={tipoCor[tipo].gradiente} tamanho={tamanho} brilho={`${tipoCor[tipo].hex}88`}>
      <TipoIcone tipo={tipo} className={icone} />
    </GlossyTile>
  )
}

export function TipoBadge({ tipo }: { tipo: Tipo }) {
  const c = tipoCor[tipo]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${c.texto} ${c.fundo}`}>
      <TipoIcone tipo={tipo} className="size-3.5" />
      {TIPO_LABEL[tipo]}
    </span>
  )
}

/** Placa no padrão Mercosul (fictícia). */
export function PlacaMercosul({ placa, tamanho = 'md' }: { placa: string; tamanho?: 'sm' | 'md' }) {
  const sm = tamanho === 'sm'
  return (
    <span
      className={`inline-flex flex-col overflow-hidden rounded-[5px] bg-white text-center ring-1 ring-black/40 ${sm ? 'w-[74px]' : 'w-[118px]'}`}
      aria-label={`Placa ${placa}`}
    >
      <span className={`bg-[#1d4fb8] font-semibold tracking-[0.2em] text-white ${sm ? 'text-[5.5px] leading-[8px]' : 'text-[8px] leading-[12px]'}`}>BRASIL</span>
      <span className={`font-mono font-bold tracking-[0.08em] text-[#111] ${sm ? 'text-[12px] leading-[17px]' : 'text-[19px] leading-[26px]'}`}>
        {placa.slice(0, 3)}
        {placa.slice(3)}
      </span>
    </span>
  )
}

export function ConfidenceMeter({ valor, compacto = false }: { valor: number; compacto?: boolean }) {
  const pct = Math.round(valor * 100)
  const cor = pct >= 85 ? 'from-[#7dd3a8] to-[#34d399]' : pct >= 70 ? 'from-[#bef264] to-[#a3e635]' : 'from-[#71717a] to-[#a1a1aa]'
  return (
    <div className="flex items-center gap-2.5" title="Confiança simulada — valor fictício">
      {!compacto && <span className="text-[11.5px] font-medium text-fg-mute">Confiança</span>}
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Confiança simulada"
      >
        <div className={`h-full rounded-full bg-gradient-to-r ${cor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-9 text-right text-[12.5px] font-semibold text-fg tabular-nums">{formatarConfianca(valor)}</span>
    </div>
  )
}
