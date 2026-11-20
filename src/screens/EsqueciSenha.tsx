import { ArrowLeft, Check, KeyRound, Lock, Mail, MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Campo, CampoSenha } from '../components/Form'
import { USUARIO_DEMO } from '../types'
import { AuthLayout } from './AuthLayout'

type Passo = 'email' | 'enviado' | 'nova' | 'pronto'

const regras = (s: string) => [
  { ok: s.length >= 8, texto: 'Pelo menos 8 caracteres' },
  { ok: /\d/.test(s), texto: 'Pelo menos um número' },
  { ok: /[A-Za-zÀ-ú]/.test(s), texto: 'Pelo menos uma letra' },
]

export function EsqueciSenha({ fundo, emailInicial = '', onVoltar, onSenhaRedefinida }: { fundo: string; emailInicial?: string; onVoltar: () => void; onSenhaRedefinida: (senha: string, email: string) => void }) {
  const [passo, setPasso] = useState<Passo>('email')
  const [email, setEmail] = useState(emailInicial)
  const [erroEmail, setErroEmail] = useState<string>()
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erroSenha, setErroSenha] = useState<string>()
  const [carregando, setCarregando] = useState(false)

  const enviarEmail = (ev: FormEvent) => {
    ev.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErroEmail('Informe um e-mail válido.')
    setErroEmail(undefined)
    setCarregando(true)
    window.setTimeout(() => {
      setCarregando(false)
      setPasso('enviado')
    }, 700)
  }

  const salvarSenha = (ev: FormEvent) => {
    ev.preventDefault()
    if (!regras(senha).every((r) => r.ok)) return setErroSenha('A nova senha não atende aos requisitos.')
    if (senha !== confirma) return setErroSenha('As senhas não conferem.')
    setErroSenha(undefined)
    setPasso('pronto')
  }

  const contaExiste = email.trim().toLowerCase() === USUARIO_DEMO.email
  const passos: Passo[] = ['email', 'enviado', 'nova']
  const indice = passo === 'pronto' ? 3 : passos.indexOf(passo)

  return (
    <AuthLayout fundo={fundo}>
      <div className="mb-5 flex items-center justify-center gap-1.5" aria-label={`Etapa ${Math.min(indice + 1, 3)} de 3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i <= indice ? 'w-8 bg-white' : 'w-4 bg-white/20'}`} />
        ))}
      </div>

      {passo === 'email' && (
        <>
          <h1 className="text-center text-[22px] font-semibold tracking-tight text-fg">Esqueceu a senha?</h1>
          <p className="mt-1 text-center text-[13px] text-fg-mute">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>
          <form onSubmit={enviarEmail} noValidate className="mt-6 space-y-4">
            <Campo rotulo="E-mail" icone={Mail} type="email" autoComplete="email" placeholder="nome@sentinela360.rio" value={email} onChange={(e) => setEmail(e.target.value)} erro={erroEmail} />
            <Button type="submit" variante="primario" tamanho="lg" className="w-full" disabled={carregando} icone={<Mail className="size-4" />}>
              {carregando ? 'Enviando…' : 'Enviar link de redefinição'}
            </Button>
          </form>
        </>
      )}

      {passo === 'enviado' && (
        <>
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/[0.1] text-fg ring-1 ring-inset ring-white/10">
            <MailCheck className="size-6" />
          </div>
          <h1 className="mt-4 text-center text-[22px] font-semibold tracking-tight text-fg">Verifique seu e-mail</h1>
          <p className="mt-1 text-center text-[13px] text-fg-mute">
            Se existir uma conta para <span className="text-fg-soft">{email.trim()}</span>, você receberá um link válido por 30 minutos.
          </p>
          {/* e-mail simulado, para a demonstração seguir sem caixa de entrada real */}
          <div className="mt-5 rounded-2xl bg-black/[0.16] p-4 ring-1 ring-inset ring-white/[0.08]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-fg-mute">E-mail simulado</div>
            {contaExiste ? (
              <>
                <div className="mt-1.5 text-[13px] font-medium text-fg">Sentinela 360 · Redefinição de senha</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-fg-soft">Olá, {USUARIO_DEMO.nome.split(' ')[0]}. Clique no botão abaixo para criar uma nova senha.</p>
                <Button variante="neutro" tamanho="sm" className="mt-3" onClick={() => setPasso('nova')} icone={<KeyRound className="size-3.5" />}>
                  Abrir link de redefinição
                </Button>
              </>
            ) : (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-soft">Nenhuma conta usa esse e-mail, então nada foi enviado. Na demonstração, use {USUARIO_DEMO.email}.</p>
            )}
          </div>
          <button type="button" onClick={() => setPasso('email')} className="mt-4 w-full text-center text-[12.5px] font-medium text-fg-soft hover:text-fg">
            Usar outro e-mail
          </button>
        </>
      )}

      {passo === 'nova' && (
        <>
          <h1 className="text-center text-[22px] font-semibold tracking-tight text-fg">Crie uma nova senha</h1>
          <p className="mt-1 text-center text-[13px] text-fg-mute">Para {email.trim()}</p>
          <form onSubmit={salvarSenha} noValidate className="mt-6 space-y-4">
            <CampoSenha rotulo="Nova senha" icone={Lock} autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <ul className="space-y-1">
              {regras(senha).map((r) => (
                <li key={r.texto} className={`flex items-center gap-2 text-[12px] ${r.ok ? 'text-confirmado' : 'text-fg-mute'}`}>
                  <Check className={`size-3.5 ${r.ok ? '' : 'opacity-30'}`} strokeWidth={3} />
                  {r.texto}
                </li>
              ))}
            </ul>
            <CampoSenha rotulo="Confirmar nova senha" icone={Lock} autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} erro={erroSenha} />
            <Button type="submit" variante="primario" tamanho="lg" className="w-full" icone={<KeyRound className="size-4" />}>
              Salvar nova senha
            </Button>
          </form>
        </>
      )}

      {passo === 'pronto' && (
        <>
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-confirmado/20 text-confirmado ring-1 ring-inset ring-confirmado/30">
            <Check className="size-7" strokeWidth={2.6} />
          </div>
          <h1 className="mt-4 text-center text-[22px] font-semibold tracking-tight text-fg">Senha redefinida</h1>
          <p className="mt-1 text-center text-[13px] text-fg-mute">Use a nova senha para entrar na central.</p>
          <Button variante="primario" tamanho="lg" className="mt-6 w-full" onClick={() => onSenhaRedefinida(senha, email.trim())}>
            Ir para o login
          </Button>
        </>
      )}

      {passo !== 'pronto' && (
        <button type="button" onClick={onVoltar} className="mt-5 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-medium text-fg-soft hover:text-fg">
          <ArrowLeft className="size-3.5" />
          Voltar ao login
        </button>
      )}
    </AuthLayout>
  )
}
