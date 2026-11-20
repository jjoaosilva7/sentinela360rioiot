// Foto de fundo: Av. Atlântica vista do alto, Copacabana (Unsplash, Azzedine Rouichi), embutida para não depender de rede externa.
import FOTO from './assets/fundo-rio.jpg?inline'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { StatusBadge, TipoBadge } from './components/Badges'
import { BotaoTopo } from './components/BotaoTopo'
import { Button } from './components/Button'
import { Modal } from './components/Modal'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import { ordenarRecentes, proximoPendente } from './lib/format'
import { ehCampoDeTexto } from './lib/interacoes'
import { Configuracoes } from './screens/Configuracoes'
import { DetalheEvento } from './screens/DetalheEvento'
import { EsqueciSenha } from './screens/EsqueciSenha'
import { ListaEventos } from './screens/ListaEventos'
import { Login } from './screens/Login'
import { Perfil } from './screens/Perfil'
import {
  FILTROS_INICIAIS,
  PREFERENCIAS_PADRAO,
  SENHA_DEMO,
  USUARIO_DEMO,
  eventosIniciais,
  infracoesDe,
  type Evento,
  type Filtros,
  type Preferencias,
  type Tipo,
  type Usuario,
  type Visao,
} from './types'

type Rota = { tela: 'login' } | { tela: 'esqueci' } | { tela: 'lista' } | { tela: 'detalhe'; id: string } | { tela: 'perfil' } | { tela: 'config' }

const lerRota = (): Rota => {
  const h = window.location.hash
  if (h.startsWith('#/login')) return { tela: 'login' }
  if (h.startsWith('#/esqueci-senha')) return { tela: 'esqueci' }
  if (h.startsWith('#/perfil')) return { tela: 'perfil' }
  if (h.startsWith('#/configuracoes')) return { tela: 'config' }
  const m = h.match(/^#\/evento\/([\w-]+)/)
  return m ? { tela: 'detalhe', id: decodeURIComponent(m[1]) } : { tela: 'lista' }
}

// A sessão fica no navegador; as decisões continuam só em memória (recarregar restaura a base).
const CHAVE_SESSAO = 's360-sessao'
const sessaoSalva = () => sessionStorage.getItem(CHAVE_SESSAO) === '1' || localStorage.getItem(CHAVE_SESSAO) === '1'
const copiaBase = () => eventosIniciais.map((e) => ({ ...e }))

function SobrePrototipo() {
  return (
    <div className="space-y-3 text-[13px] leading-relaxed text-fg-soft">
      <p>
        O <span className="font-semibold text-fg">Sentinela 360 Rio</span> é um protótipo acadêmico de central de revisão de alertas de trânsito: o sistema detecta a possível
        infração e o agente aprova ou recusa a multa.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Base fictícia de {eventosIniciais.length} alertas em JSON, com fotos de exemplo (não são do Rio) e rostos e placas borrados.</li>
        <li>A detecção é uma animação sobre a foto; não há câmeras, vídeo ao vivo nem IA em execução.</li>
        <li>No licenciamento, a placa e a consulta à base são simuladas; a certeza é de 100%.</li>
        <li>Login, perfil e configurações funcionam sem servidor; as decisões voltam ao estado inicial ao recarregar a página.</li>
        <li>Os autos de infração são simulados e nada é enviado a órgão público.</li>
      </ul>
    </div>
  )
}

export default function App() {
  const [eventos, setEventos] = useState<Evento[]>(copiaBase)
  const [prefs, setPrefs] = useState<Preferencias>(PREFERENCIAS_PADRAO)
  const [filtros, setFiltros] = useState<Filtros>({ ...FILTROS_INICIAIS, ordem: PREFERENCIAS_PADRAO.ordemPadrao })
  const [visao, setVisao] = useState<Visao>(PREFERENCIAS_PADRAO.visaoPadrao)
  const [rota, setRota] = useState<Rota>(lerRota)
  const [logado, setLogado] = useState(sessaoSalva)
  const [usuario, setUsuario] = useState<Usuario>(USUARIO_DEMO)
  const [senha, setSenha] = useState(SENHA_DEMO)
  const [emailAcesso, setEmailAcesso] = useState('')
  const [avisoLogin, setAvisoLogin] = useState<string | null>(null)
  const [sobreAberto, setSobreAberto] = useState(false)
  const [reiniciarAberto, setReiniciarAberto] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const scrollLista = useRef(0)

  useEffect(() => {
    document.title = 'Sentinela 360 Rio · Central de alertas'
    document.documentElement.lang = 'pt-BR'
    const onHash = () => {
      const nova = lerRota()
      setRota((atual) => {
        if (atual.tela === 'lista' && nova.tela !== 'lista') scrollLista.current = window.scrollY
        return nova
      })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (rota.tela === 'lista') requestAnimationFrame(() => window.scrollTo({ top: scrollLista.current }))
    else window.scrollTo({ top: 0 })
  }, [rota])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(id)
  }, [toast])

  // atalhos de teclado (só com sessão): "/" foca a busca da central; "?" mostra a ajuda
  useEffect(() => {
    if (!logado) return
    const aoTeclar = (ev: KeyboardEvent) => {
      // não interfere quando o usuário está digitando ou usando combinações como Ctrl+/
      if (ev.ctrlKey || ev.metaKey || ev.altKey || ehCampoDeTexto(ev.target)) return

      if (ev.key === '/') {
        const busca = document.getElementById('busca-eventos') as HTMLInputElement | null
        if (!busca) return // a busca só existe na lista de alertas
        ev.preventDefault()
        busca.focus()
        busca.select()
      } else if (ev.key === '?') {
        setToast('Atalhos: / busca eventos · Esc fecha janelas')
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [logado])

  const irPara = useCallback((hash: string) => {
    if (window.location.hash === hash) setRota(lerRota())
    else window.location.hash = hash
  }, [])
  const abrir = (id: string) => irPara(`#/evento/${id}`)
  const irLista = (f?: Partial<Filtros>) => {
    if (f) setFiltros((atual) => ({ ...atual, ...f }))
    irPara('#/')
  }

  // ---- sessão
  const entrar = (lembrar: boolean) => {
    ;(lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, '1')
    setLogado(true)
    setAvisoLogin(null)
    scrollLista.current = 0
    irPara('#/')
  }
  const sair = () => {
    sessionStorage.removeItem(CHAVE_SESSAO)
    localStorage.removeItem(CHAVE_SESSAO)
    setLogado(false)
    setAvisoLogin(null)
    irPara('#/login')
  }

  // ---- decisões
  const decidir = (id: string, status: 'confirmado' | 'descartado', observacao: string, infracoes?: Tipo[]) => {
    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setEventos((lista) =>
      lista.map((e) =>
        e.id === id && e.status === 'novo'
          ? { ...e, status, observacao: observacao || undefined, decididoEm: agora, infracoesConfirmadas: status === 'confirmado' ? infracoes : undefined }
          : e,
      ),
    )
  }

  const reiniciar = () => {
    setEventos(copiaBase())
    setFiltros({ ...FILTROS_INICIAIS, ordem: prefs.ordemPadrao })
    setVisao(prefs.visaoPadrao)
    setReiniciarAberto(false)
    setToast('Base inicial restaurada')
  }

  const mudarPrefs = (p: Preferencias) => {
    if (p.visaoPadrao !== prefs.visaoPadrao) setVisao(p.visaoPadrao)
    if (p.ordemPadrao !== prefs.ordemPadrao) setFiltros((f) => ({ ...f, ordem: p.ordemPadrao }))
    setPrefs(p)
  }

  // ---- telas de acesso (sem sessão)
  if (!logado) {
    if (rota.tela === 'esqueci')
      return (
        <EsqueciSenha
          fundo={FOTO}
          emailInicial={emailAcesso}
          onVoltar={() => irPara('#/login')}
          onSenhaRedefinida={(nova, email) => {
            setSenha(nova)
            setEmailAcesso(email)
            setAvisoLogin('Senha redefinida. Entre com a nova senha.')
            irPara('#/login')
          }}
        />
      )
    return (
      <Login
        key={avisoLogin ?? 'login'}
        fundo={FOTO}
        senhaAtual={senha}
        emailInicial={emailAcesso}
        aviso={avisoLogin}
        onEntrar={entrar}
        onEsqueci={(email) => {
          setEmailAcesso(email)
          irPara('#/esqueci-senha')
        }}
      />
    )
  }

  // com sessão, as telas de acesso levam à central
  const tela = rota.tela === 'login' || rota.tela === 'esqueci' ? 'lista' : rota.tela
  const atual = rota.tela === 'detalhe' ? eventos.find((e) => e.id === rota.id) : undefined
  const pendentes = ordenarRecentes(eventos).filter((e) => e.status === 'novo')
  const proximo = atual ? proximoPendente(eventos, atual.id) : pendentes[0]

  let titulo: ReactNode = 'Central de alertas'
  let subtitulo = 'Alertas detectados pelas câmeras · o agente aprova ou recusa cada multa'
  if (tela === 'detalhe') {
    titulo = atual ? (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-semibold tabular-nums">{atual.id}</span>
        {infracoesDe(atual).map((t) => (
          <TipoBadge key={t} tipo={t} />
        ))}
        <StatusBadge status={atual.status} className="text-[11.5px]" />
      </span>
    ) : (
      'Alerta não encontrado'
    )
    subtitulo = atual ? `${atual.local} · ${atual.camera}` : 'O alerta solicitado não existe na base simulada'
  } else if (tela === 'perfil') {
    titulo = 'Meu perfil'
    subtitulo = 'Seus dados, segurança da conta e atividade nesta sessão'
  } else if (tela === 'config') {
    titulo = 'Configurações'
    subtitulo = 'Ajuste a fila, a evidência e as notificações da central'
  }

  return (
    <div className="relative min-h-screen p-2.5 sm:p-5 lg:p-7">
      <div aria-hidden className="fixed inset-0 -z-10 bg-[#2e2b2a]">
        <div className="size-full bg-cover bg-position-[30%_60%] [filter:grayscale(1)_brightness(.78)_contrast(1.02)]" style={{ backgroundImage: `url(${FOTO})` }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="glass-shell mx-auto min-h-[calc(100vh-1.25rem)] max-w-[1440px] rounded-[26px] px-4 py-4 sm:min-h-[calc(100vh-2.5rem)] sm:rounded-[30px] sm:px-7 sm:py-5 lg:min-h-[calc(100vh-3.5rem)]">
        <TopBar
          usuario={usuario}
          pendentes={pendentes}
          mostrarContador={prefs.contadorSino}
          onAbrirEvento={abrir}
          onVerPendentes={() => irLista({ status: 'novo', tipo: 'todos' })}
          onIr={irPara}
          onSobre={() => setSobreAberto(true)}
          onSair={sair}
        />

        <header className="mb-6 mt-6 flex flex-wrap items-start gap-4">
          {tela !== 'lista' && (
            <button
              type="button"
              onClick={() => irLista()}
              aria-label="Voltar à central"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.08] text-fg ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-white/70"
            >
              <ArrowLeft className="size-[18px]" />
            </button>
          )}
          <div className="mr-auto min-w-0">
            <h1 className="font-display text-[24px] font-semibold leading-tight tracking-tight text-fg sm:text-[28px]">{titulo}</h1>
            <p className="mt-1 text-[12.5px] text-fg-mute">{subtitulo}</p>
          </div>
        </header>

        <main>
          {tela === 'lista' && (
            <ListaEventos
              eventos={eventos}
              filtros={filtros}
              onFiltros={setFiltros}
              visao={visao}
              onVisao={setVisao}
              onAbrir={abrir}
              filtrosPadrao={{ ...FILTROS_INICIAIS, ordem: prefs.ordemPadrao }}
            />
          )}
          {tela === 'detalhe' &&
            (atual ? (
              <DetalheEvento key={atual.id} evento={atual} proximo={proximo} onDecidir={decidir} onVoltar={() => irLista()} onAbrir={abrir} prefs={prefs} />
            ) : (
              <div className="glass mx-auto max-w-md rounded-[20px] p-8 text-center">
                <p className="text-[14px] text-fg-soft">O alerta “{rota.tela === 'detalhe' ? rota.id : ''}” não existe na base simulada.</p>
                <Button variante="primario" className="mt-5" onClick={() => irLista()}>
                  Voltar à central
                </Button>
              </div>
            ))}
          {tela === 'perfil' && (
            <Perfil
              usuario={usuario}
              senhaAtual={senha}
              eventos={eventos}
              onAbrir={abrir}
              onSalvar={(u) => {
                setUsuario(u)
                setToast('Perfil atualizado')
              }}
              onTrocarSenha={(nova) => {
                setSenha(nova)
                setToast('Senha alterada')
              }}
            />
          )}
          {tela === 'config' && <Configuracoes prefs={prefs} onChange={mudarPrefs} onReiniciar={() => setReiniciarAberto(true)} onSobre={() => setSobreAberto(true)} onSair={sair} />}
        </main>

        <footer className="mt-10 border-t border-line pt-4 text-[11px] leading-relaxed text-fg-mute">
          Sentinela 360 Rio · protótipo acadêmico com dados fictícios e fotos de exemplo · decisões mantidas apenas nesta sessão · autos de infração simulados, nada é enviado a
          órgão público.
        </footer>
      </div>

      <Modal aberto={sobreAberto} titulo="Sobre o protótipo" onFechar={() => setSobreAberto(false)}>
        <SobrePrototipo />
      </Modal>

      <Modal aberto={reiniciarAberto} titulo="Restaurar base inicial?" onFechar={() => setReiniciarAberto(false)}>
        <p className="text-[13px] leading-relaxed text-fg-soft">As decisões desta sessão serão apagadas e os {eventosIniciais.length} alertas voltam ao estado original.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variante="neutro" onClick={() => setReiniciarAberto(false)}>
            Cancelar
          </Button>
          <Button variante="primario" onClick={reiniciar}>
            Restaurar
          </Button>
        </div>
      </Modal>

      <BotaoTopo />
      <Toast mensagem={toast} />
    </div>
  )
}
