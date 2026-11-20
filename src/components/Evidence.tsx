import { Camera, Cctv, Pause, Play, RotateCcw, ScanEye, ScanSearch } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatarData, relogio, somarSegundos } from '../lib/format'
import { TIPO_LABEL, infracoesDe, type Evento, type MarcacaoInfracao, type Tipo } from '../types'
import { tipoCor } from './Badges'

/** Duração do ciclo da simulação de detecção, em segundos. */
const CICLO = 9

/** Texto da etiqueta sobre a marcação, conforme o que a câmera detectou. */
const ROTULO: Record<Tipo, string> = {
  bloqueio_cruzamento: 'VEÍCULO',
  celular: 'CELULAR',
  cinto: 'SEM CINTO',
  caminhao_esquerda: 'CAMINHÃO',
  nao_licenciado: 'PLACA',
}

const FASE_DETECCAO: Record<Tipo, string> = {
  bloqueio_cruzamento: 'Detectando veículos no cruzamento',
  celular: 'Analisando o condutor',
  cinto: 'Analisando o condutor',
  caminhao_esquerda: 'Classificando veículos por faixa',
  nao_licenciado: 'Lendo placas dos veículos',
}

const FASE_ANALISE: Record<Tipo, string> = {
  bloqueio_cruzamento: 'Veículo parado sobre a área amarela',
  celular: 'Celular na mão do condutor',
  cinto: 'Cinto de segurança ausente',
  caminhao_esquerda: 'Caminhão na faixa da esquerda',
  nao_licenciado: 'Consultando a base de licenciamento',
}

/** Etapas mostradas abaixo da linha do tempo, com o início de cada uma (fração do ciclo). */
const ETAPAS = [
  { inicio: 0, rotulo: 'Monitorar', icone: Cctv },
  { inicio: 0.16, rotulo: 'Detectar', icone: ScanSearch },
  { inicio: 0.4, rotulo: 'Analisar', icone: ScanEye },
  { inicio: 0.62, rotulo: 'Registrar', icone: Camera },
]

const limitar = (v: number) => Math.min(1, Math.max(0, v))
const suave = (v: number) => {
  const x = limitar(v)
  return x * x * (3 - 2 * x)
}

export function Evidence({ evento, autoplay = true, mostrarMarcacoes = true }: { evento: Evento; autoplay?: boolean; mostrarMarcacoes?: boolean }) {
  const temVideo = !!evento.video
  const videoRef = useRef<HTMLVideoElement>(null)
  // sem reprodução automática, abre já no estado final (com as marcações visíveis)
  const [t, setT] = useState(() => (temVideo || autoplay ? 0 : CICLO))
  const [tocando, setTocando] = useState(temVideo || autoplay)
  const [durVideo, setDurVideo] = useState<number | null>(null)
  const [proporcao, setProporcao] = useState<number | null>(null)
  const tRef = useRef(t)
  tRef.current = t

  const total = temVideo ? (durVideo ?? evento.duracaoSegundos) : CICLO
  const durEvento = evento.duracaoSegundos

  // relógio da simulação (~30 quadros/s; intervalo funciona mesmo onde o requestAnimationFrame é suspenso)
  useEffect(() => {
    if (!tocando || temVideo) return
    let anterior = performance.now()
    const id = window.setInterval(() => {
      const agora = performance.now()
      const n = tRef.current + Math.min(0.1, (agora - anterior) / 1000)
      anterior = agora
      if (n >= CICLO) {
        if (!autoplay) {
          tRef.current = CICLO
          setT(CICLO)
          setTocando(false)
          return
        }
        tRef.current = 0
        setT(0)
      } else {
        tRef.current = n
        setT(n)
      }
    }, 33)
    return () => window.clearInterval(id)
  }, [tocando, temVideo, autoplay])

  const alternar = () => {
    const v = videoRef.current
    if (v) {
      if (v.paused) void v.play()
      else v.pause()
      return
    }
    if (!tocando && t >= CICLO) setT(0)
    setTocando((x) => !x)
  }

  const irPara = (s: number) => {
    if (videoRef.current) videoRef.current.currentTime = s
    tRef.current = s
    setT(s)
  }

  // ---- fases da simulação (em vídeo real, mostra tudo de forma estática)
  const p = temVideo ? 1 : t / CICLO
  const tipos = infracoesDe(evento)
  const marcas: MarcacaoInfracao[] = evento.marcacao ? [{ tipo: evento.tipo, ...evento.marcacao }, ...(evento.marcacoesExtras ?? [])] : []
  const alvo = marcas[0]

  // zoom: aproxima do alvo e o puxa para perto do centro; volta no fim do ciclo
  let transform = 'none'
  let escala = 1
  if (alvo && !temVideo) {
    const z = suave((p - 0.4) / 0.18) * (1 - suave((p - 0.86) / 0.12))
    const sAlvo = Math.min(2.2, Math.max(1.2, 38 / Math.max(alvo.w, alvo.h)))
    const s = 1 + (sAlvo - 1) * z
    const cx = alvo.x + alvo.w / 2
    const cy = alvo.y + alvo.h / 2
    const lim = (s - 1) * 50
    const tx = Math.max(-lim, Math.min(lim, (50 - cx) * z * 0.8 - (s - 1) * (cx - 50)))
    const ty = Math.max(-lim, Math.min(lim, (50 - cy) * z * 0.8 - (s - 1) * (cy - 50)))
    transform = `translate(${tx}%, ${ty}%) scale(${s})`
    escala = s
  }

  const varrendo = !temVideo && p < 0.42
  const yVarredura = ((p / 0.42) * 2) % 1
  const flash = temVideo ? 0 : Math.max(0, 0.55 * (1 - Math.abs(p - 0.63) / 0.05))
  const etapa = temVideo ? 3 : ETAPAS.reduce((idx, e, i) => (p >= e.inicio ? i : idx), 0)

  const textoAnalise = tipos.length > 1 ? tipos.map((x) => FASE_ANALISE[x]).join(' · ') : FASE_ANALISE[evento.tipo]
  const textoFase =
    etapa === 0
      ? 'Monitorando'
      : etapa === 1
        ? FASE_DETECCAO[evento.tipo]
        : etapa === 2
          ? textoAnalise
          : evento.tipo === 'nao_licenciado'
            ? 'Restrição encontrada · evidência registrada'
            : 'Evidência registrada'

  return (
    <figure className="glass rounded-[20px] p-2.5">
      <div className="relative overflow-hidden rounded-[14px] bg-black">
        <img aria-hidden src={evento.imagem} alt="" className="absolute inset-0 size-full scale-110 object-cover opacity-45 blur-2xl" draggable={false} />
        <div className="relative mx-auto overflow-hidden" style={{ width: proporcao ? `min(100%, calc(68vh * ${proporcao}))` : '100%' }}>
          {/* camada que recebe o zoom: mídia + marcações juntas, para continuarem alinhadas */}
          <div className="relative origin-center will-change-transform" style={{ transform }}>
            {temVideo ? (
              <video
                ref={videoRef}
                src={evento.video}
                poster={evento.imagem}
                autoPlay
                muted
                loop
                playsInline
                aria-label={`Vídeo da câmera ${evento.camera}: ${TIPO_LABEL[evento.tipo].toLowerCase()}`}
                className="block h-auto w-full [filter:saturate(.85)_contrast(1.04)]"
                onLoadedMetadata={(e) => {
                  setProporcao(e.currentTarget.videoWidth / e.currentTarget.videoHeight)
                  setDurVideo(e.currentTarget.duration)
                }}
                onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
                onPlay={() => setTocando(true)}
                onPause={() => setTocando(false)}
              />
            ) : (
              <img
                src={evento.imagem}
                alt={`Captura da câmera ${evento.camera} com a marcação de ${TIPO_LABEL[evento.tipo].toLowerCase()}`}
                className="block h-auto w-full [filter:saturate(.8)_contrast(1.06)_brightness(.94)]"
                onLoad={(e) => setProporcao(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                draggable={false}
              />
            )}

            {mostrarMarcacoes &&
              marcas.map((m, i) => {
                const c = m.neutra ? '#e7e5e4' : tipoCor[m.tipo].hex
                const trava = suave((p - 0.16 - i * 0.06) / 0.12)
                const comRotulo = p >= 0.34 + i * 0.06
                const abaixo = m.y < 15 || (i === 0 && marcas.length > 1)
                // leitura da placa caractere a caractere (OCR simulado)
                let texto = m.rotulo ?? ROTULO[m.tipo]
                if (!m.rotulo && m.tipo === 'nao_licenciado' && evento.placa) {
                  const n = temVideo ? evento.placa.length : Math.floor(limitar((p - 0.36) / 0.2) * evento.placa.length)
                  texto = `PLACA ${evento.placa.slice(0, n)}${n < evento.placa.length ? '▌' : ''}`
                }
                return (
                  <div
                    key={`${m.tipo}-${i}`}
                    className="pointer-events-none absolute rounded-md"
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      width: `${m.w}%`,
                      height: `${m.h}%`,
                      border: `2px ${m.neutra ? 'dashed' : 'solid'} ${c}`,
                      boxShadow: m.neutra ? undefined : `0 0 0 ${trava < 1 ? 0 : 3}px ${c}33`,
                      opacity: trava,
                      transform: `scale(${1.6 - 0.6 * trava})`,
                    }}
                  >
                    {(['-left-1 -top-1 border-l-[3px] border-t-[3px]', '-right-1 -top-1 border-r-[3px] border-t-[3px]', '-left-1 -bottom-1 border-l-[3px] border-b-[3px]', '-right-1 -bottom-1 border-r-[3px] border-b-[3px]'] as const).map((k) => (
                      <span key={k} className={`absolute size-3 ${k}`} style={{ borderColor: c }} />
                    ))}
                    <span
                      className={`absolute z-10 whitespace-nowrap rounded px-2 py-0.5 font-mono text-[11px] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-opacity duration-300 sm:text-[12.5px] ${
                        m.neutra ? 'text-[#1c1a19]' : 'text-white'
                      } ${m.x < 10 ? 'left-0' : m.x + m.w > 90 ? 'right-0' : 'left-1/2 -translate-x-1/2'} ${abaixo ? 'top-full mt-1.5' : 'bottom-full mb-1.5'}`}
                      style={{
                        background: c,
                        opacity: comRotulo ? 1 : 0,
                        // compensa o zoom para a etiqueta manter o tamanho de leitura
                        scale: `${1 / (escala * (1.6 - 0.6 * trava))}`,
                        transformOrigin: `${m.x < 10 ? 'left' : m.x + m.w > 90 ? 'right' : 'center'} ${abaixo ? 'top' : 'bottom'}`,
                      }}
                    >
                      {texto}
                    </span>
                  </div>
                )
              })}
          </div>

          {/* textura de câmera e efeitos (fora do zoom) */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.16)_0_1px,transparent_1px_3px)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
          {varrendo && (
            <div
              className="pointer-events-none absolute inset-x-0 h-[22%] bg-gradient-to-b from-transparent to-accent/25"
              style={{ top: `calc(${yVarredura * 122 - 22}%)`, opacity: 1 - suave((p - 0.36) / 0.06) }}
            >
              <div className="absolute inset-x-0 bottom-0 h-px bg-accent shadow-[0_0_12px_2px_rgba(75,139,245,0.8)]" />
            </div>
          )}
          {flash > 0 && <div className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: flash }} />}

          {/* HUD */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5 font-mono text-[10.5px] font-semibold text-white/90 sm:p-3.5 sm:text-[12px]">
            <span className="flex items-center gap-2 rounded bg-black/55 px-2 py-1">
              <span className="relative flex size-2">
                {tocando && <span className="animate-ping-soft absolute inset-0 rounded-full bg-rose-500" />}
                <span className="relative size-2 rounded-full bg-rose-500" />
              </span>
              {evento.camera}
            </span>
            <span className="rounded bg-black/55 px-2 py-1 tabular-nums">
              {formatarData(evento.data)} {somarSegundos(evento.horario, (t / total) * durEvento)}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-2.5 sm:p-3.5">
            <span
              key={textoFase}
              className={`animate-rise max-w-full truncate rounded-full px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wide sm:text-[11.5px] ${
                etapa === 3 ? 'bg-confirmado/90 text-[#05200f]' : 'bg-black/65 text-white'
              }`}
            >
              {textoFase}
              {etapa > 0 && etapa < 3 && '…'}
            </span>
          </div>
        </div>
      </div>

      <figcaption className="px-2 pb-1.5 pt-3.5">
        <div className="flex items-center gap-3">
          <span className="w-10 text-[11px] text-fg-mute tabular-nums">{relogio((t / total) * durEvento)}</span>
          <input
            type="range"
            min={0}
            max={total}
            step={0.05}
            value={t}
            onChange={(e) => irPara(Number(e.target.value))}
            aria-label="Linha do tempo do evento"
            className="h-1 min-w-0 flex-1 cursor-pointer accent-accent"
          />
          <span className="w-10 text-right text-[11px] text-fg-mute tabular-nums">{relogio(durEvento)}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {/* etapas do processamento, acompanhando a simulação */}
          <ol className="flex items-center gap-1" aria-label="Etapas da detecção">
            {ETAPAS.map((e, i) => {
              const I = e.icone
              const ativa = i === etapa
              const feita = i < etapa
              return (
                <li key={e.rotulo} className="flex items-center gap-1">
                  {i > 0 && <span className={`h-px w-3 sm:w-5 ${feita || ativa ? 'bg-white/50' : 'bg-white/15'}`} />}
                  <button
                    type="button"
                    onClick={() => irPara(temVideo ? 0 : e.inicio * CICLO + 0.01)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition ${
                      ativa ? 'bg-white text-[#1c1a19]' : feita ? 'text-fg-soft hover:text-fg' : 'text-fg-mute hover:text-fg-soft'
                    }`}
                  >
                    <I className="size-3.5" />
                    <span className="hidden sm:inline">{e.rotulo}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => irPara(0)}
              aria-label="Voltar ao início"
              className="grid size-10 place-items-center rounded-full bg-white/[0.1] text-fg ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.16] focus-visible:outline-2 focus-visible:outline-white/70"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={alternar}
              aria-label={tocando ? 'Pausar' : 'Reproduzir'}
              className="grid size-12 place-items-center rounded-full bg-white text-[#1f1d1c] shadow-[0_10px_24px_-10px_rgba(255,255,255,0.5)] transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              {tocando ? <Pause className="size-[18px]" fill="currentColor" /> : <Play className="ml-0.5 size-[18px]" fill="currentColor" />}
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-fg-mute">
          {temVideo ? 'Vídeo da câmera · reprodução em loop' : 'Simulação da detecção sobre a foto da câmera · ilustrativa, sem vídeo real'}
        </p>
      </figcaption>
    </figure>
  )
}
