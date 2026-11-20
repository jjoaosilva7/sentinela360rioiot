import type { ReactNode } from 'react'
import { Logo } from '../components/Logo'

/** Moldura das telas de acesso: foto de fundo e cartão de vidro centralizado. */
export function AuthLayout({ fundo, children }: { fundo: string; children: ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center p-4">
      <div aria-hidden className="fixed inset-0 -z-10 bg-[#2e2b2a]">
        {/* enquadramento puxado para a avenida, que fica no canto inferior esquerdo da foto */}
        <div className="size-full bg-cover bg-position-[30%_60%] [filter:grayscale(1)_brightness(.7)]" style={{ backgroundImage: `url(${fundo})` }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="glass-shell animate-rise rounded-[28px] p-7 sm:p-8">
          <div className="mb-7 flex justify-center">
            <Logo />
          </div>
          {children}
        </div>
        <p className="mt-4 text-center text-[11.5px] text-white/60">Protótipo acadêmico · dados fictícios · nada é enviado a órgão público</p>
      </div>
    </div>
  )
}
