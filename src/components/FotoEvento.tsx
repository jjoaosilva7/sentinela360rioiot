import type { Evento } from '../types'

/** Foto do evento recortada (object-cover) e centralizada no veículo marcado. */
export function FotoEvento({ evento, className = '' }: { evento: Evento; className?: string }) {
  const m = evento.marcacao
  const foco = m ? `${Math.min(100, Math.max(0, m.x + m.w / 2))}% ${Math.min(100, Math.max(0, m.y + m.h / 2))}%` : '50% 50%'
  return (
    <img
      src={evento.imagem}
      alt=""
      loading="lazy"
      draggable={false}
      className={`object-cover [filter:saturate(.85)_contrast(1.04)] ${className}`}
      style={{ objectPosition: foco }}
    />
  )
}
