import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const DISTANCIA_MINIMA = 400 // pixels rolados até o botão aparecer

/** Botão flutuante que surge depois que a página é rolada e leva o usuário de volta ao topo. */
export function BotaoTopo() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > DISTANCIA_MINIMA)
    aoRolar() // confere a posição inicial, caso a página já esteja rolada
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])

  if (!visivel) return null

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reduzirMovimento ? 'auto' : 'smooth' })}
      aria-label="Voltar ao topo"
      className="animate-rise fixed bottom-5 right-5 z-[60] grid size-11 place-items-center rounded-full border border-white/12 bg-[#2f2d2c] text-fg shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] transition hover:bg-[#3a3735] focus-visible:outline-2 focus-visible:outline-white/70"
    >
      <ArrowUp className="size-[18px]" />
    </button>
  )
}
