import { CircleCheck } from 'lucide-react'

/** Aviso curto no topo da tela (ex.: "Perfil atualizado"). */
export function Toast({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null
  return (
    <div role="status" className="animate-rise fixed left-1/2 top-5 z-[70] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-white/12 bg-[#2f2d2c] px-4 py-2.5 text-[13px] font-medium text-fg shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
        <CircleCheck className="size-4 text-confirmado" />
        {mensagem}
      </div>
    </div>
  )
}
