export function Chips<T extends string>({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string
  valor: T
  opcoes: { valor: T; label: string; total: number }[]
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="flex shrink-0 items-center gap-0.5 rounded-full bg-black/[0.16] p-1 ring-1 ring-inset ring-white/[0.07]">
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(o.valor)}
            className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full pl-3 pr-1.5 text-[12.5px] font-medium transition focus-visible:outline-2 focus-visible:outline-white/70 ${
              ativo ? 'bg-white/[0.15] text-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]' : 'text-fg-soft hover:text-fg'
            }`}
          >
            {o.label}
            <span
              className={`min-w-5 rounded-md px-1.5 py-px text-center text-[10.5px] font-semibold tabular-nums ${ativo ? 'bg-accent text-white' : 'bg-white/[0.1] text-fg-soft'}`}
            >
              {o.total}
            </span>
          </button>
        )
      })}
    </div>
  )
}
