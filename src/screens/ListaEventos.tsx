import { ArrowUpRight, Ban, Check, Inbox, LayoutGrid, List, Receipt, RotateCcw, Search, SearchX, Sparkle, X } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '../components/Button'
import { Chips } from '../components/Chips'
import { EventCard } from '../components/EventCard'
import { EventTable } from '../components/EventTable'
import { aplicarFiltros, resumo } from '../lib/format'
import { FILTROS_INICIAIS, TIPO_CURTO, TIPOS, infracoesDe, type Evento, type FiltroStatus, type FiltroTipo, type Filtros, type Ordem, type Visao } from '../types'

function StatCard({
  rotulo,
  valor,
  icone,
  brilho,
  ativo,
  onClick,
}: {
  rotulo: string
  valor: number
  icone: React.ReactNode
  brilho: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`glass group relative overflow-hidden rounded-[20px] p-4 text-left transition duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-white/70 sm:p-5 ${
        ativo ? 'border-white/25 bg-white/[0.12]' : ''
      }`}
    >
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full opacity-40 blur-3xl" style={{ background: brilho }} />
      <div className="relative flex items-start justify-between">
        <span className="grid size-8 place-items-center rounded-[10px] bg-white/[0.12] text-fg ring-1 ring-inset ring-white/10">{icone}</span>
        <ArrowUpRight className={`size-4 transition ${ativo ? 'text-fg' : 'text-fg-mute opacity-0 group-hover:opacity-100'}`} />
      </div>
      <div className="relative mt-5 text-[26px] font-semibold leading-none tracking-tight text-fg tabular-nums">{valor}</div>
      <div className="relative mt-1.5 text-[12px] text-fg-mute">{rotulo}</div>
    </button>
  )
}

function ProgressoCard({ revisados, total, percentual }: { revisados: number; total: number; percentual: number }) {
  const R = 30
  const C = 2 * Math.PI * R
  return (
    <div
      className="glass relative col-span-2 flex items-center gap-4 overflow-hidden rounded-[20px] p-4 sm:col-span-1 sm:p-5"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={revisados}
      aria-label={`${revisados} de ${total} alertas revisados`}
    >
      <span aria-hidden className="pointer-events-none absolute -left-8 -top-10 size-32 rounded-full bg-accent opacity-25 blur-3xl" />
      <div className="relative size-[76px] shrink-0">
        <svg viewBox="0 0 76 76" className="size-full -rotate-90">
          <circle cx="38" cy="38" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle cx="38" cy="38" r={R + 6} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="1 4" />
          <circle
            cx="38"
            cy="38"
            r={R}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(percentual / 100) * C} ${C}`}
            className="transition-[stroke-dasharray] duration-700"
            style={{ filter: 'drop-shadow(0 0 6px rgba(75,139,245,0.7))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[18px] font-semibold text-fg tabular-nums">
            {percentual}
            <span className="align-top text-[10px]">%</span>
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="text-[13.5px] font-medium text-fg">Progresso da revisão</div>
        <div className="mt-1 text-[12px] text-fg-mute">
          <span className="font-semibold text-fg-soft">{revisados}</span> de {total} revisados
        </div>
      </div>
    </div>
  )
}

const selectCls =
  'h-9 appearance-none rounded-full bg-black/[0.16] pl-4 pr-9 text-[12.5px] font-medium text-fg ring-1 ring-inset ring-white/[0.07] outline-none focus:ring-2 focus:ring-white/40 [&>option]:bg-[#4a4645]'

function Seta() {
  return <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-fg-mute">▼</span>
}

export function ListaEventos({
  eventos,
  filtros,
  onFiltros,
  visao,
  onVisao,
  onAbrir,
  filtrosPadrao = FILTROS_INICIAIS,
}: {
  eventos: Evento[]
  filtros: Filtros
  onFiltros: (f: Filtros) => void
  visao: Visao
  onVisao: (v: Visao) => void
  onAbrir: (id: string) => void
  /** estado de "Limpar filtros" (a ordenação vem das configurações) */
  filtrosPadrao?: Filtros
}) {
  const r = resumo(eventos)
  const lista = useMemo(() => aplicarFiltros(eventos, filtros), [eventos, filtros])
  const alterado = filtros.busca !== filtrosPadrao.busca || filtros.tipo !== filtrosPadrao.tipo || filtros.status !== filtrosPadrao.status
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) => onFiltros({ ...filtros, [k]: v })
  // limpar mantém a ordenação escolhida
  const limpar = () => onFiltros({ ...filtrosPadrao, ordem: filtros.ordem })
  const porStatus = (s: FiltroStatus) => set('status', filtros.status === s ? 'todos' : s)
  const contaTipo = (t: FiltroTipo) => (t === 'todos' ? eventos.length : eventos.filter((e) => infracoesDe(e).includes(t)).length)

  return (
    <div className="space-y-4">
      <section aria-label="Resumo da revisão" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        <ProgressoCard revisados={r.revisados} total={r.total} percentual={r.percentual} />
        <StatCard rotulo="Total de eventos" valor={r.total} brilho="#7c8aa8" icone={<Inbox className="size-4" />} ativo={filtros.status === 'todos'} onClick={() => set('status', 'todos')} />
        <StatCard rotulo="Novos" valor={r.novos} brilho="#4b8bf5" icone={<Sparkle className="size-4" />} ativo={filtros.status === 'novo'} onClick={() => porStatus('novo')} />
        <StatCard rotulo="Confirmados" valor={r.confirmados} brilho="#4ade80" icone={<Check className="size-4" strokeWidth={2.4} />} ativo={filtros.status === 'confirmado'} onClick={() => porStatus('confirmado')} />
        <StatCard rotulo="Descartados" valor={r.descartados} brilho="#c9c3bf" icone={<Ban className="size-4" />} ativo={filtros.status === 'descartado'} onClick={() => porStatus('descartado')} />
        <StatCard rotulo="Autos emitidos" valor={r.autuados} brilho="#f87171" icone={<Receipt className="size-4" />} ativo={filtros.status === 'autuado'} onClick={() => porStatus('autuado')} />
      </section>

      <section aria-label="Filtros" className="glass flex flex-wrap items-center gap-2 rounded-[20px] p-2">
        {/* busca ancorada à esquerda */}
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Buscar eventos</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-mute" />
          <input
            id="busca-eventos"
            type="search"
            aria-keyshortcuts="/"
            value={filtros.busca}
            onChange={(e) => set('busca', e.target.value)}
            placeholder="Buscar ID, câmera, local ou tipo…"
            className="h-9 w-full rounded-full bg-black/[0.16] pl-10 pr-9 text-[12.5px] text-fg ring-1 ring-inset ring-white/[0.07] outline-none placeholder:text-fg-mute focus:ring-2 focus:ring-white/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {filtros.busca && (
            <button
              type="button"
              onClick={() => set('busca', '')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-fg-mute hover:bg-white/10 hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
        {/* filtros e, ao lado, a ação de limpá-los */}
        <div className="-mx-1 max-w-full overflow-x-auto px-1">
          <Chips<FiltroTipo>
            rotulo="Filtrar por tipo"
            valor={filtros.tipo}
            onChange={(v) => set('tipo', v)}
            opcoes={[
              { valor: 'todos', label: 'Todos', total: contaTipo('todos') },
              ...TIPOS.map((t) => ({ valor: t, label: TIPO_CURTO[t], total: contaTipo(t) })),
            ]}
          />
        </div>
        <label className="relative">
          <span className="sr-only">Filtrar por status</span>
          <select value={filtros.status} onChange={(e) => set('status', e.target.value as FiltroStatus)} className={selectCls}>
            <option value="todos">Todos os status</option>
            <option value="novo">Novos</option>
            <option value="confirmado">Confirmados</option>
            <option value="descartado">Descartados</option>
            <option value="autuado">Autos emitidos</option>
          </select>
          <Seta />
        </label>
        <Button variante="fantasma" tamanho="sm" onClick={limpar} disabled={!alterado} icone={<RotateCcw className="size-3.5" />}>
          Limpar filtros
        </Button>
      </section>

      {/* resultados à esquerda; ordenação e visualização à direita, junto da lista */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-[12px] text-fg-mute" aria-live="polite">
          {lista.length === eventos.length ? `${lista.length} eventos` : `${lista.length} de ${eventos.length} eventos`}
          {filtros.ordem === 'antigos' ? ' · mais antigos' : ' · mais recentes'}
        </p>
        <div className="flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">Ordenar lista</span>
            <select value={filtros.ordem} onChange={(e) => set('ordem', e.target.value as Ordem)} className={selectCls}>
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
            </select>
            <Seta />
          </label>
          <div role="radiogroup" aria-label="Visualização" className="flex rounded-full bg-black/[0.16] p-1 ring-1 ring-inset ring-white/[0.07]">
            {(
              [
                ['grade', LayoutGrid, 'Grade de cards'],
                ['lista', List, 'Lista em tabela'],
              ] as const
            ).map(([v, Icone, rot]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={visao === v}
                aria-label={rot}
                title={rot}
                onClick={() => onVisao(v)}
                className={`grid h-7 w-8 place-items-center rounded-full transition ${visao === v ? 'bg-white/[0.16] text-fg' : 'text-fg-mute hover:text-fg'}`}
              >
                <Icone className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-[20px] px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/[0.1] text-fg-soft ring-1 ring-inset ring-white/10">
            <SearchX className="size-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-fg">Nenhum evento encontrado</h2>
          <p className="mt-1 max-w-sm text-[13px] text-fg-soft">Nenhum alerta corresponde aos filtros e à busca atuais. Ajuste os critérios ou volte à visualização inicial.</p>
          <Button variante="primario" className="mt-5" onClick={limpar} icone={<RotateCcw className="size-4" />}>
            Limpar filtros
          </Button>
        </div>
      ) : visao === 'grade' ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3 sm:gap-4">
          {lista.map((e, i) => (
            <li key={e.id} className="animate-rise flex" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
              <EventCard evento={e} />
            </li>
          ))}
        </ul>
      ) : (
        <EventTable eventos={lista} onAbrir={onAbrir} />
      )}
    </div>
  )
}
