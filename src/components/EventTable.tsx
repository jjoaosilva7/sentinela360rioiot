import { ChevronRight } from 'lucide-react'
import { formatarData } from '../lib/format'
import { rotuloInfracoes, type Evento } from '../types'
import { StatusBadge } from './Badges'
import { FotoEvento } from './FotoEvento'

export function EventTable({ eventos, onAbrir }: { eventos: Evento[]; onAbrir: (id: string) => void }) {
  return (
    <div className="glass overflow-x-auto rounded-[20px] p-2">
      <table className="w-full min-w-[700px] border-separate border-spacing-y-1 text-left text-[12.5px]">
        <thead>
          <tr className="text-[11px] font-medium text-fg-mute">
            <th className="px-3 py-2 font-medium">Evento</th>
            <th className="px-3 py-2 font-medium">Local</th>
            <th className="px-3 py-2 font-medium">Câmera</th>
            <th className="px-3 py-2 font-medium">Data e horário</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {eventos.map((e) => (
            <tr
              key={e.id}
              onClick={() => onAbrir(e.id)}
              className="group cursor-pointer bg-white/[0.04] transition hover:bg-white/[0.09] [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl"
            >
              <td className="px-3 py-2.5">
                <a href={`#/evento/${e.id}`} onClick={(ev) => ev.stopPropagation()} className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-white/70">
                  <FotoEvento evento={e} className="block h-11 w-16 shrink-0 rounded-lg ring-1 ring-white/10" />
                  <span>
                    <span className="block font-semibold text-fg tabular-nums">{e.id}</span>
                    <span className="block text-[11px] text-fg-mute">{rotuloInfracoes(e)}</span>
                  </span>
                </a>
              </td>
              <td className="max-w-[280px] px-3 py-2.5 text-fg-soft">
                <span className="line-clamp-1">{e.local}</span>
              </td>
              <td className="px-3 py-2.5 font-medium tracking-wide text-fg-soft tabular-nums">{e.camera}</td>
              <td className="px-3 py-2.5 text-fg-soft tabular-nums">
                {formatarData(e.data)} · {e.horario}
              </td>
              <td className="px-3 py-2.5">
                <StatusBadge status={e.status} />
              </td>
              <td className="pr-3 text-fg-mute">
                <ChevronRight className="size-4 transition group-hover:translate-x-0.5 group-hover:text-fg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
