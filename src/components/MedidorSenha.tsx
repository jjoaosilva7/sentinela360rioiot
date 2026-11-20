import { avaliarSenha } from '../lib/interacoes'

/** Mostra, abaixo do campo, a força da nova senha conforme o usuário digita. */
export function MedidorSenha({ senha }: { senha: string }) {
  const forca = avaliarSenha(senha)
  if (!forca) return null // campo vazio: o medidor some

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((barra) => (
          <span key={barra} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${barra <= forca.pontos ? forca.cor : 'bg-white/10'}`} />
        ))}
      </div>
      <p className="mt-1.5 text-[11.5px] text-fg-mute">
        Força da senha: <span className={`font-semibold ${forca.texto}`}>{forca.rotulo}</span>
      </p>
    </div>
  )
}
