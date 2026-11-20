import { Check, Copy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { copiarTexto } from '../lib/interacoes'

type Estado = 'inicial' | 'copiado' | 'falhou'

/** Copia o texto ao clicar e mostra, por 2 segundos, se deu certo ou não. */
export function BotaoCopiar({ texto, rotulo = 'Copiar nº' }: { texto: string; rotulo?: string }) {
  const [estado, setEstado] = useState<Estado>('inicial')

  // a resposta some sozinha; sem resposta pendente, nada é agendado
  useEffect(() => {
    if (estado === 'inicial') return
    const id = window.setTimeout(() => setEstado('inicial'), 2000)
    return () => window.clearTimeout(id)
  }, [estado])

  const copiar = async () => {
    const ok = await copiarTexto(texto)
    setEstado(ok ? 'copiado' : 'falhou')
  }

  const Icone = estado === 'copiado' ? Check : estado === 'falhou' ? X : Copy
  const legenda = estado === 'copiado' ? 'Copiado!' : estado === 'falhou' ? 'Não foi possível copiar' : rotulo
  const cor =
    estado === 'copiado'
      ? 'text-confirmado ring-confirmado/40'
      : estado === 'falhou'
        ? 'text-autuado ring-autuado/40'
        : 'text-fg-soft ring-white/15 hover:bg-white/[0.08] hover:text-fg'

  return (
    <button
      type="button"
      onClick={copiar}
      title={`Copiar ${texto}`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition focus-visible:outline-2 focus-visible:outline-white/70 ${cor}`}
    >
      <Icone className="size-3" />
      <span aria-live="polite">{legenda}</span>
    </button>
  )
}
