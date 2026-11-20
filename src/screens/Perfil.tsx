import { BadgeCheck, Building2, ChevronRight, IdCard, KeyRound, Lock, Mail, Phone, Save, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { StatusBadge } from '../components/Badges'
import { Button } from '../components/Button'
import { Campo, CampoSenha } from '../components/Form'
import { MedidorSenha } from '../components/MedidorSenha'
import { autosDe, iniciais, rotuloInfracoes, type Evento, type Usuario } from '../types'

function Cartao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[20px] p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-fg">{titulo}</h2>
      {descricao && <p className="mt-0.5 text-[12.5px] text-fg-mute">{descricao}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Perfil({
  usuario,
  senhaAtual,
  eventos,
  onSalvar,
  onTrocarSenha,
  onAbrir,
}: {
  usuario: Usuario
  senhaAtual: string
  eventos: Evento[]
  onSalvar: (u: Usuario) => void
  onTrocarSenha: (nova: string) => void
  onAbrir: (id: string) => void
}) {
  const [nome, setNome] = useState(usuario.nome)
  const [telefone, setTelefone] = useState(usuario.telefone)
  const [erroNome, setErroNome] = useState<string>()

  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erroSenha, setErroSenha] = useState<{ atual?: string; nova?: string; confirma?: string }>({})

  // decisões tomadas nesta sessão (as da base inicial não têm horário de decisão)
  const atividade = eventos.filter((e) => e.decididoEm).sort((a, b) => (b.decididoEm ?? '').localeCompare(a.decididoEm ?? ''))
  const aprovadas = atividade.reduce((n, e) => n + autosDe(e).length, 0)
  const recusados = atividade.filter((e) => e.status === 'descartado').length

  const salvarDados = (ev: FormEvent) => {
    ev.preventDefault()
    if (nome.trim().split(' ').filter(Boolean).length < 2) return setErroNome('Informe nome e sobrenome.')
    setErroNome(undefined)
    onSalvar({ ...usuario, nome: nome.trim(), telefone: telefone.trim() })
  }

  const salvarSenha = (ev: FormEvent) => {
    ev.preventDefault()
    const e: typeof erroSenha = {}
    if (atual !== senhaAtual) e.atual = 'Senha atual incorreta.'
    if (nova.length < 8 || !/\d/.test(nova)) e.nova = 'Use pelo menos 8 caracteres e um número.'
    else if (nova === atual) e.nova = 'A nova senha deve ser diferente da atual.'
    if (confirma !== nova) e.confirma = 'As senhas não conferem.'
    setErroSenha(e)
    if (e.atual || e.nova || e.confirma) return
    onTrocarSenha(nova)
    setAtual('')
    setNova('')
    setConfirma('')
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-7 lg:self-start">
        <section className="glass relative overflow-hidden rounded-[20px] p-6 text-center">
          <span aria-hidden className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-accent opacity-20 blur-3xl" />
          <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-[#e7e2dd] to-[#8d8682] text-[24px] font-semibold text-[#2b2827] ring-4 ring-white/15">
            {iniciais(usuario.nome)}
          </div>
          <div className="relative mt-3 text-[18px] font-semibold text-fg">{usuario.nome}</div>
          <div className="relative text-[12.5px] text-fg-mute">{usuario.cargo}</div>
          <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-confirmado/12 px-2.5 py-1 text-[11.5px] font-medium text-confirmado ring-1 ring-inset ring-confirmado/30">
            <span className="size-1.5 rounded-full bg-current" /> Em serviço
          </span>
          <dl className="relative mt-5 space-y-2 text-left text-[12.5px]">
            {[
              [IdCard, 'Matrícula', usuario.matricula],
              [Building2, 'Unidade', usuario.unidade],
              [Mail, 'E-mail', usuario.email],
            ].map(([Icone, k, v]) => {
              const I = Icone as typeof IdCard
              return (
                <div key={k as string} className="flex items-start gap-2.5 rounded-xl bg-white/[0.05] px-3 py-2 ring-1 ring-inset ring-white/[0.05]">
                  <I className="mt-0.5 size-3.5 shrink-0 text-fg-mute" />
                  <span className="min-w-0">
                    <dt className="text-[11px] text-fg-mute">{k as string}</dt>
                    <dd className="truncate font-medium text-fg">{v as string}</dd>
                  </span>
                </div>
              )
            })}
          </dl>
        </section>

        <section className="glass grid grid-cols-3 divide-x divide-white/10 rounded-[20px] py-4 text-center">
          {[
            ['Revisados', atividade.length],
            ['Multas aprovadas', aprovadas],
            ['Recusados', recusados],
          ].map(([k, v]) => (
            <div key={k as string} className="px-2">
              <div className="text-[22px] font-semibold text-fg tabular-nums">{v as number}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-fg-mute">{k as string}</div>
            </div>
          ))}
        </section>
      </aside>

      <div className="min-w-0 space-y-4">
        <Cartao titulo="Dados pessoais" descricao="Essas informações aparecem nos autos de infração aprovados por você.">
          <form onSubmit={salvarDados} noValidate className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome completo" icone={UserRound} value={nome} onChange={(e) => setNome(e.target.value)} erro={erroNome} />
            <Campo rotulo="Telefone" icone={Phone} value={telefone} onChange={(e) => setTelefone(e.target.value)} inputMode="tel" />
            <Campo rotulo="E-mail" icone={Mail} value={usuario.email} disabled dica="Alterado apenas pelo administrador." />
            <Campo rotulo="Matrícula" icone={BadgeCheck} value={usuario.matricula} disabled />
            <div className="sm:col-span-2">
              <Button type="submit" variante="primario" icone={<Save className="size-4" />} disabled={nome.trim() === usuario.nome && telefone.trim() === usuario.telefone}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </Cartao>

        <Cartao titulo="Segurança" descricao="Troque sua senha de acesso à central.">
          <form onSubmit={salvarSenha} noValidate className="grid gap-4 sm:grid-cols-3">
            <CampoSenha rotulo="Senha atual" icone={Lock} autoComplete="current-password" value={atual} onChange={(e) => setAtual(e.target.value)} erro={erroSenha.atual} />
            <div>
              <CampoSenha rotulo="Nova senha" icone={KeyRound} autoComplete="new-password" value={nova} onChange={(e) => setNova(e.target.value)} erro={erroSenha.nova} dica="Mínimo de 8 caracteres e um número." />
              <MedidorSenha senha={nova} />
            </div>
            <CampoSenha rotulo="Confirmar nova senha" icone={KeyRound} autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} erro={erroSenha.confirma} />
            <div className="sm:col-span-3">
              <Button type="submit" variante="neutro" icone={<KeyRound className="size-4" />} disabled={!atual || !nova || !confirma}>
                Alterar senha
              </Button>
            </div>
          </form>
        </Cartao>

        <Cartao titulo="Atividade nesta sessão" descricao="Decisões registradas por você desde o login.">
          {atividade.length === 0 ? (
            <p className="rounded-2xl bg-black/[0.12] px-4 py-6 text-center text-[13px] text-fg-mute ring-1 ring-inset ring-white/[0.06]">Nenhuma decisão registrada ainda.</p>
          ) : (
            <ul className="space-y-1.5">
              {atividade.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onAbrir(e.id)}
                    className="group flex w-full items-center gap-3 rounded-2xl bg-black/[0.12] px-3.5 py-2.5 text-left ring-1 ring-inset ring-white/[0.06] transition hover:bg-white/[0.07]"
                  >
                    <span className="w-16 shrink-0 text-[12px] text-fg-mute tabular-nums">{e.decididoEm}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-fg tabular-nums">{e.id}</span>
                      <span className="block truncate text-[11.5px] text-fg-mute">{rotuloInfracoes(e)}</span>
                    </span>
                    <StatusBadge status={e.status} />
                    <ChevronRight className="size-4 text-fg-mute transition group-hover:translate-x-0.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </div>
    </div>
  )
}
