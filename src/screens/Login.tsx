import { Lock, LogIn, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { Campo, CampoSenha } from '../components/Form'
import { USUARIO_DEMO, SENHA_DEMO } from '../types'
import { AuthLayout } from './AuthLayout'

export function Login({
  fundo,
  senhaAtual,
  emailInicial = '',
  aviso,
  onEntrar,
  onEsqueci,
}: {
  fundo: string
  senhaAtual: string
  emailInicial?: string
  aviso?: string | null
  onEntrar: (lembrar: boolean) => void
  onEsqueci: (email: string) => void
}) {
  const [email, setEmail] = useState(emailInicial)
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(true)
  const [erro, setErro] = useState<{ email?: string; senha?: string; geral?: string }>({})
  const [carregando, setCarregando] = useState(false)

  const enviar = (ev: FormEvent) => {
    ev.preventDefault()
    const e: typeof erro = {}
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Informe um e-mail válido.'
    if (senha.length < 6) e.senha = 'A senha tem pelo menos 6 caracteres.'
    setErro(e)
    if (e.email || e.senha) return
    setCarregando(true)
    // simula a verificação no servidor
    window.setTimeout(() => {
      setCarregando(false)
      if (email.trim().toLowerCase() !== USUARIO_DEMO.email || senha !== senhaAtual) {
        setErro({ geral: 'E-mail ou senha incorretos.' })
        return
      }
      onEntrar(lembrar)
    }, 650)
  }

  return (
    <AuthLayout fundo={fundo}>
      <h1 className="text-center text-[22px] font-semibold tracking-tight text-fg">Acesse a central</h1>
      <p className="mt-1 text-center text-[13px] text-fg-mute">Entre com sua conta de operador para revisar os alertas.</p>

      {aviso && <p className="mt-5 rounded-2xl bg-confirmado/12 px-4 py-3 text-[12.5px] text-confirmado ring-1 ring-inset ring-confirmado/30">{aviso}</p>}
      {erro.geral && (
        <p role="alert" className="mt-5 rounded-2xl bg-autuado/12 px-4 py-3 text-[12.5px] text-autuado ring-1 ring-inset ring-autuado/30">
          {erro.geral}
        </p>
      )}

      <form onSubmit={enviar} noValidate className="mt-5 space-y-4">
        <Campo rotulo="E-mail" icone={Mail} type="email" autoComplete="username" placeholder="nome@sentinela360.rio" value={email} onChange={(e) => setEmail(e.target.value)} erro={erro.email} />
        <CampoSenha
          rotulo="Senha"
          icone={Lock}
          autoComplete="current-password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erro.senha}
          acao={
            <button type="button" onClick={() => onEsqueci(email)} className="text-[12px] font-medium text-fg-soft underline-offset-2 hover:text-fg hover:underline">
              Esqueci minha senha
            </button>
          }
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-[12.5px] text-fg-soft">
          <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} className="size-4 accent-white" />
          Manter conectado neste computador
        </label>
        <Button type="submit" variante="primario" tamanho="lg" className="w-full" disabled={carregando} icone={<LogIn className="size-4" />}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl bg-black/[0.16] p-3.5 ring-1 ring-inset ring-white/[0.07]">
        <div className="text-[11.5px] font-semibold uppercase tracking-wide text-fg-mute">Acesso de demonstração</div>
        <div className="mt-1 text-[12.5px] text-fg-soft">
          {USUARIO_DEMO.email} · senha <span className="font-semibold text-fg">{senhaAtual === SENHA_DEMO ? SENHA_DEMO : 'redefinida por você'}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail(USUARIO_DEMO.email)
            if (senhaAtual === SENHA_DEMO) setSenha(SENHA_DEMO)
            setErro({})
          }}
          className="mt-2 text-[12px] font-medium text-accent hover:underline"
        >
          Preencher acesso de demonstração
        </button>
      </div>
    </AuthLayout>
  )
}
