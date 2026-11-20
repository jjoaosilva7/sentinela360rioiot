import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Popover simples: fecha ao clicar fora ou com Esc. */
export function Popover({
  gatilho,
  children,
  posicao = 'baixo-direita',
  className = 'w-72',
}: {
  gatilho: (p: { aberto: boolean; alternar: () => void }) => ReactNode
  children: (fechar: () => void) => ReactNode
  posicao?: 'baixo-direita' | 'lado'
  className?: string
}) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const fora = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setAberto(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('pointerdown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])
  return (
    <div ref={ref} className="relative">
      {gatilho({ aberto, alternar: () => setAberto((a) => !a) })}
      {aberto && (
        <div
          className={`animate-rise absolute z-50 rounded-2xl border border-white/12 bg-[#3b3837] p-2 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] ${
            posicao === 'lado' ? 'bottom-0 left-full ml-3' : 'right-0 top-full mt-2'
          } ${className}`}
        >
          {children(() => setAberto(false))}
        </div>
      )}
    </div>
  )
}
