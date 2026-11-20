import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

const inputCls =
  'h-11 w-full rounded-2xl bg-black/[0.18] px-4 text-[14px] text-fg ring-1 ring-inset ring-white/[0.09] outline-none transition placeholder:text-fg-mute focus:ring-2 focus:ring-white/45 disabled:opacity-60'

export function Campo({
  rotulo,
  icone: Icone,
  erro,
  dica,
  acao,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; icone?: LucideIcon; erro?: string; dica?: string; acao?: ReactNode }) {
  const id = useId()
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[12.5px] font-medium text-fg-soft">
          {rotulo}
        </label>
        {acao}
      </div>
      <div className="relative">
        {Icone && <Icone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-mute" />}
        <input id={id} {...props} aria-invalid={!!erro} className={`${inputCls} ${Icone ? 'pl-10' : ''} ${erro ? 'ring-autuado/70' : ''} ${props.className ?? ''}`} />
      </div>
      {erro ? <p className="mt-1.5 text-[12px] text-autuado">{erro}</p> : dica ? <p className="mt-1.5 text-[11.5px] text-fg-mute">{dica}</p> : null}
    </div>
  )
}

export function CampoSenha(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { rotulo: string; icone?: LucideIcon; erro?: string; dica?: string; acao?: ReactNode }) {
  const [ver, setVer] = useState(false)
  return (
    <div className="relative">
      <Campo {...props} type={ver ? 'text' : 'password'} className="pr-11" />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-2 top-[30px] grid size-8 place-items-center rounded-full text-fg-mute hover:bg-white/10 hover:text-fg"
      >
        {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export function Interruptor({ marcado, onChange, rotulo, descricao }: { marcado: boolean; onChange: (v: boolean) => void; rotulo: string; descricao?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 py-3.5">
      <span>
        <span className="block text-[13.5px] font-medium text-fg">{rotulo}</span>
        {descricao && <span className="mt-0.5 block text-[12px] leading-snug text-fg-mute">{descricao}</span>}
      </span>
      <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-accent peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-white/60" />
    </label>
  )
}

export function Segmentado<T extends string>({ valor, opcoes, onChange, rotulo }: { valor: T; opcoes: { valor: T; label: string }[]; onChange: (v: T) => void; rotulo: string }) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="inline-flex rounded-full bg-black/[0.18] p-1 ring-1 ring-inset ring-white/[0.08]">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={`h-8 rounded-full px-3.5 text-[12.5px] font-medium transition ${valor === o.valor ? 'bg-white text-[#1c1a19]' : 'text-fg-soft hover:text-fg'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Linha de configuração: título/descrição à esquerda e controle à direita. */
export function LinhaConfig({ rotulo, descricao, children }: { rotulo: string; descricao?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5">
      <span>
        <span className="block text-[13.5px] font-medium text-fg">{rotulo}</span>
        {descricao && <span className="mt-0.5 block text-[12px] leading-snug text-fg-mute">{descricao}</span>}
      </span>
      {children}
    </div>
  )
}
