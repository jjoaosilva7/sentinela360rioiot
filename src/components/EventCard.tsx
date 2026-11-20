import { Cctv, ChevronRight, MapPin } from 'lucide-react'
import { formatarData } from '../lib/format'
import { rotuloInfracoes, type Evento } from '../types'
import { StatusBadge } from './Badges'
import { FotoEvento } from './FotoEvento'

export function EventCard({ evento }: { evento: Evento }) {
  const decidido = evento.status !== 'novo'
  return (
    <a
      href={`#/evento/${evento.id}`}
      aria-label={`${evento.id}, ${rotuloInfracoes(evento)}, ${evento.status}`}
      className={`glass group flex w-full flex-col rounded-[20px] p-2.5 transition duration-300 hover:-translate-y-1 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
        decidido ? 'opacity-80 hover:opacity-100' : ''
      }`}
    >
      <div className="relative h-[150px] overflow-hidden rounded-[14px] bg-black/30 ring-1 ring-inset ring-white/[0.06]">
        <FotoEvento evento={evento} className="absolute inset-0 size-full transition duration-500 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
        <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10.5px] font-medium text-fg ring-1 ring-inset ring-white/[0.1] backdrop-blur-sm tabular-nums">
          {formatarData(evento.data).slice(0, 5)} · {evento.horario.slice(0, 5)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <span className="whitespace-nowrap text-[13.5px] font-semibold text-fg tabular-nums">{evento.id}</span>
        <div className="mt-0.5 text-[11.5px] text-fg-mute">{rotuloInfracoes(evento)}</div>
        <div className="mt-1.5 flex items-start gap-1 text-[11.5px] leading-snug text-fg-soft">
          <MapPin className="mt-px size-3 shrink-0 text-fg-mute" />
          <span className="line-clamp-2">{evento.local}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11.5px] text-fg-mute">
          <span className="inline-flex items-center gap-1.5 font-medium tracking-wide text-fg-soft tabular-nums">
            <Cctv className="size-3.5 text-fg-mute" />
            {evento.camera}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <StatusBadge status={evento.status} />
            <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:text-fg" />
          </span>
        </div>
      </div>
    </a>
  )
}
