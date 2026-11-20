import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

/** Janela modal simples: fecha com Esc ou clicando fora. */
export function Modal({ aberto, titulo, onFechar, children, largura = 'max-w-md' }: { aberto: boolean; titulo: string; onFechar: () => void; children: ReactNode; largura?: string }) {
  useEffect(() => {
    if (!aberto) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [aberto, onFechar])
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onFechar} />
      <div className={`animate-rise relative w-full ${largura} rounded-[22px] border border-white/12 bg-[#3b3837] p-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]`}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[17px] font-semibold text-fg">{titulo}</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="-mr-1 -mt-1 grid size-8 place-items-center rounded-full text-fg-mute hover:bg-white/10 hover:text-fg">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
