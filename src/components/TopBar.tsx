import { Bell, ChevronDown, Info, LogOut, Settings, UserRound } from 'lucide-react'
import { formatarData } from '../lib/format'
import { iniciais, rotuloInfracoes, type Evento, type Usuario } from '../types'
import { FotoEvento } from './FotoEvento'
import { Logo } from './Logo'
import { Popover } from './Popover'

function ItemMenu({ icone: Icone, children, onClick, perigo = false }: { icone: typeof Bell; children: React.ReactNode; onClick: () => void; perigo?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition hover:bg-white/[0.08] ${perigo ? 'text-autuado' : 'text-fg'}`}
    >
      <Icone className="size-4 opacity-80" />
      {children}
    </button>
  )
}

export function TopBar({
  usuario,
  pendentes,
  mostrarContador,
  onAbrirEvento,
  onVerPendentes,
  onIr,
  onSobre,
  onSair,
}: {
  usuario: Usuario
  pendentes: Evento[]
  mostrarContador: boolean
  onAbrirEvento: (id: string) => void
  onVerPendentes: () => void
  onIr: (hash: string) => void
  onSobre: () => void
  onSair: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
      <a href="#/" aria-label="Sentinela 360 Rio — central de alertas" className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70">
        <Logo />
      </a>

      <div className="flex items-center gap-2">
        <Popover
          className="w-80"
          gatilho={({ aberto, alternar }) => (
            <button
              type="button"
              onClick={alternar}
              aria-expanded={aberto}
              aria-label={`Alertas pendentes: ${pendentes.length}`}
              className={`relative grid size-10 place-items-center rounded-full text-fg ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.14] ${aberto ? 'bg-white/[0.16]' : 'bg-white/[0.08]'}`}
            >
              <Bell className="size-[17px]" />
              {mostrarContador && pendentes.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-[#575352]">
                  {pendentes.length}
                </span>
              )}
            </button>
          )}
        >
          {(fechar) => (
            <div>
              <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
                <span className="text-[13.5px] font-semibold text-fg">Pendentes</span>
                <span className="text-[11.5px] text-fg-mute">{pendentes.length} aguardando revisão</span>
              </div>
              {pendentes.length === 0 ? (
                <p className="px-2 py-6 text-center text-[12.5px] text-fg-soft">Todos os alertas foram revisados.</p>
              ) : (
                <ul className="max-h-80 space-y-0.5 overflow-y-auto">
                  {pendentes.slice(0, 6).map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => {
                          fechar()
                          onAbrirEvento(e.id)
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.08]"
                      >
                        <FotoEvento evento={e} className="h-10 w-14 shrink-0 rounded-lg ring-1 ring-white/10" />
                        <span className="min-w-0 flex-1">
                          <span className="flex justify-between gap-2 text-[12.5px] font-semibold text-fg">
                            <span className="tabular-nums">{e.id}</span>
                            <span className="font-normal text-fg-mute tabular-nums">
                              {formatarData(e.data).slice(0, 5)} {e.horario.slice(0, 5)}
                            </span>
                          </span>
                          <span className="block truncate text-[11.5px] text-fg-mute">{rotuloInfracoes(e)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {pendentes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    fechar()
                    onVerPendentes()
                  }}
                  className="mt-1 w-full rounded-xl py-2 text-[12px] font-medium text-fg-soft transition hover:bg-white/[0.08] hover:text-fg"
                >
                  Ver todos os pendentes
                </button>
              )}
            </div>
          )}
        </Popover>

        <Popover
          className="w-64"
          gatilho={({ aberto, alternar }) => (
            <button
              type="button"
              onClick={alternar}
              aria-expanded={aberto}
              aria-label="Menu do usuário"
              className={`flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.12] ${aberto ? 'bg-white/[0.14]' : 'bg-white/[0.06]'}`}
            >
              <span className="relative grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#d9d4cf] to-[#8d8682] text-[12px] font-semibold text-[#2b2827]">
                {iniciais(usuario.nome)}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#4ade80] ring-2 ring-[#575352]" />
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-[12.5px] font-semibold text-fg">{usuario.nome}</span>
                <span className="block text-[11px] text-fg-mute">{usuario.cargo}</span>
              </span>
              <ChevronDown className={`size-4 text-fg-mute transition ${aberto ? 'rotate-180' : ''}`} />
            </button>
          )}
        >
          {(fechar) => (
            <div>
              <div className="px-3 pb-2 pt-1.5">
                <div className="text-[13px] font-semibold text-fg">{usuario.nome}</div>
                <div className="truncate text-[11.5px] text-fg-mute">{usuario.email}</div>
              </div>
              <div className="my-1 h-px bg-white/10" />
              <ItemMenu icone={UserRound} onClick={() => (fechar(), onIr('#/perfil'))}>
                Meu perfil
              </ItemMenu>
              <ItemMenu icone={Settings} onClick={() => (fechar(), onIr('#/configuracoes'))}>
                Configurações
              </ItemMenu>
              <ItemMenu icone={Info} onClick={() => (fechar(), onSobre())}>
                Sobre o protótipo
              </ItemMenu>
              <div className="my-1 h-px bg-white/10" />
              <ItemMenu icone={LogOut} perigo onClick={() => (fechar(), onSair())}>
                Sair
              </ItemMenu>
            </div>
          )}
        </Popover>
      </div>
    </div>
  )
}
