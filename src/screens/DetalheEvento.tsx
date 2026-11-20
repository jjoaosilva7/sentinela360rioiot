import { ArrowLeft, Ban, Calendar, Cctv, Check, CircleCheck, CircleX, Clock, Info, MapPin, Receipt, Scale, SkipForward, Tag, Timer } from 'lucide-react'
import { useState } from 'react'
import { PlacaMercosul, StatusBadge, TipoBadge, TipoTile } from '../components/Badges'
import { Button } from '../components/Button'
import { BotaoCopiar } from '../components/BotaoCopiar'
import { Evidence } from '../components/Evidence'
import { formatarData, formatarDuracao, formatarReais, numeroAuto, somarSegundos } from '../lib/format'
import { ENQUADRAMENTO, GERA_AUTO, OBSERVACAO_MAX, POR_CONSULTA, TIPO_LABEL, autosDe, infracoesDe, porConsulta, type Evento, type Preferencias, type Tipo } from '../types'
import { Modal } from '../components/Modal'

const EXEMPLO_OBS: Record<Tipo, string> = {
  bloqueio_cruzamento: 'Ex.: veículo permanece sobre a área amarela após o vermelho.',
  celular: 'Ex.: celular visível na mão do condutor durante a condução.',
  cinto: 'Ex.: faixa do cinto não aparece sobre o ombro do condutor.',
  caminhao_esquerda: 'Ex.: caminhão segue na faixa da esquerda com a direita livre.',
  nao_licenciado: 'Ex.: leitura da placa conferida; licenciamento vencido.',
}

function Dado({ icone, rotulo, children, largo = false }: { icone: React.ReactNode; rotulo: string; children: React.ReactNode; largo?: boolean }) {
  return (
    <div className={`rounded-xl bg-white/[0.05] px-3 py-2.5 ring-1 ring-inset ring-white/[0.05] ${largo ? 'col-span-2' : ''}`}>
      <dt className="flex items-center gap-1.5 text-[11px] text-fg-mute">
        {icone}
        {rotulo}
      </dt>
      <dd className="mt-1 text-[13.5px] font-medium text-fg">{children}</dd>
    </div>
  )
}

/** Autos de infração gerados após a confirmação do operador (simulação): um por infração. */
function AutoInfracao({ evento, proximo, onAbrir, onVoltar }: { evento: Evento; proximo?: Evento; onAbrir: (id: string) => void; onVoltar: () => void }) {
  const autos = autosDe(evento)
  const varios = autos.length > 1
  const emitidoEm = evento.decididoEm
    ? `${new Date().toLocaleDateString('pt-BR')} às ${evento.decididoEm}`
    : `${formatarData(evento.data)} às ${somarSegundos(evento.horario, 1800)}`
  const totalPontos = autos.reduce((n, t) => n + ENQUADRAMENTO[t].pontos, 0)
  const totalValor = autos.reduce((n, t) => n + ENQUADRAMENTO[t].valor, 0)
  return (
    <section className="glass animate-rise relative overflow-hidden rounded-[20px] p-5" aria-labelledby="auto-titulo">
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-autuado opacity-25 blur-3xl" />
      <div className="relative flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-autuado/20 text-autuado ring-1 ring-inset ring-white/10">
          <Receipt className="size-5" />
        </span>
        <div>
          <div className="text-[11.5px] text-fg-mute">Confirmado pelo operador · emitido em {emitidoEm}</div>
          <h2 id="auto-titulo" className="text-[17px] font-medium text-fg">
            {varios ? `${autos.length} autos de infração emitidos` : 'Auto de infração emitido'}
          </h2>
        </div>
      </div>

      {evento.observacao && (
        <p className="relative mt-3 rounded-xl bg-black/[0.14] px-3 py-2 text-[12.5px] leading-relaxed text-fg ring-1 ring-inset ring-white/[0.06]">
          <span className="text-fg-mute">Observação do operador: </span>
          {evento.observacao}
        </p>
      )}

      <ul className="relative mt-3 space-y-2">
        {autos.map((t, i) => {
          const enq = ENQUADRAMENTO[t]
          const numero = numeroAuto(evento, varios ? i + 1 : undefined)
          return (
            <li key={t} className="rounded-2xl bg-black/[0.14] p-3 ring-1 ring-inset ring-white/[0.06]">
              <div className="flex items-start gap-2.5">
                <TipoTile tipo={t} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-fg">{TIPO_LABEL[t]}</span>
                    <span className="shrink-0 whitespace-nowrap text-[14px] font-semibold text-fg tabular-nums">{formatarReais(enq.valor)}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] leading-snug text-fg-mute">
                    <span>
                      {numero} · {enq.artigo}
                    </span>
                    <BotaoCopiar texto={numero} />
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-fg-soft">
                    {enq.gravidade} · {enq.pontos} pontos
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {evento.placa && (
        <div className="relative mt-2 flex items-center justify-between rounded-2xl bg-black/[0.14] px-3.5 py-2 text-[12.5px] ring-1 ring-inset ring-white/[0.06]">
          <span className="text-fg-mute">Placa</span>
          <PlacaMercosul placa={evento.placa} tamanho="sm" />
        </div>
      )}

      <div className="relative mt-2 flex items-center justify-between rounded-2xl bg-white/[0.07] px-3.5 py-2.5 ring-1 ring-inset ring-white/10">
        <span className="text-[12.5px] text-fg-soft">
          Total{varios ? ` · ${autos.length} autos` : ''} · {totalPontos} pontos
        </span>
        <span className="whitespace-nowrap text-[20px] font-semibold text-fg tabular-nums">{formatarReais(totalValor)}</span>
      </div>

      <p className="relative mt-3 flex items-start gap-2 rounded-xl bg-signal/10 px-3 py-2 text-[11.5px] leading-relaxed text-signal ring-1 ring-inset ring-signal/25">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Simulação acadêmica: os autos não são enviados a nenhum órgão de trânsito. Valores de referência do CTB.
      </p>

      <div className="relative mt-4 space-y-2">
        {proximo && (
          <Button variante="primario" tamanho="lg" className="w-full" onClick={() => onAbrir(proximo.id)} icone={<SkipForward className="size-4" />}>
            Revisar próximo pendente
            <span className="text-[12px] opacity-60">{proximo.id}</span>
          </Button>
        )}
        <Button variante="neutro" tamanho="lg" className="w-full" onClick={onVoltar} icone={<ArrowLeft className="size-4" />}>
          Voltar à lista
        </Button>
      </div>
    </section>
  )
}

/** Infrações detectadas pelo sistema (somente leitura): o operador só aprova ou recusa a multa. */
function InfracoesDetectadas({ infracoes }: { infracoes: Tipo[] }) {
  const total = infracoes.reduce((n, t) => n + ENQUADRAMENTO[t].valor, 0)
  const pontos = infracoes.reduce((n, t) => n + ENQUADRAMENTO[t].pontos, 0)
  return (
    <div className="mt-4">
      <ul className="space-y-1.5">
        {infracoes.map((t) => {
          const enq = ENQUADRAMENTO[t]
          return (
            <li key={t} className="flex items-center gap-3 rounded-2xl bg-black/[0.12] px-3 py-2.5 ring-1 ring-inset ring-white/[0.07]">
              <TipoTile tipo={t} tamanho="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-fg">{TIPO_LABEL[t]}</span>
                <span className="block text-[11px] text-fg-mute">
                  {enq.artigo} · {enq.gravidade.toLowerCase()} · {enq.pontos} pts
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block whitespace-nowrap text-[13px] font-semibold text-fg tabular-nums">{formatarReais(enq.valor)}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-accent">{POR_CONSULTA[t] ? 'consulta' : 'câmera'}</span>
              </span>
            </li>
          )
        })}
      </ul>
      {infracoes.length > 1 && (
        <div className="mt-2 flex items-center justify-between px-1 text-[12px] text-fg-soft">
          <span>
            {infracoes.length} multas · {pontos} pontos
          </span>
          <span className="whitespace-nowrap font-semibold text-fg tabular-nums">{formatarReais(total)}</span>
        </div>
      )}
    </div>
  )
}

function AnelConfianca({ valor }: { valor: number }) {
  const pct = Math.round(valor * 100)
  const R = 34
  const C = 2 * Math.PI * R
  return (
    <div className="relative size-[92px] shrink-0">
      <svg viewBox="0 0 92 92" className="size-full -rotate-90">
        <circle cx="46" cy="46" r={R + 8} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="1 4" />
        <circle cx="46" cy="46" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="46"
          cy="46"
          r={R}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * C} ${C}`}
          style={{ filter: 'drop-shadow(0 0 6px rgba(75,139,245,0.7))' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <span className="text-[22px] font-semibold leading-none text-fg tabular-nums">
          {pct}
          <span className="align-top text-[11px]">%</span>
        </span>
      </div>
    </div>
  )
}

export function DetalheEvento({
  evento,
  proximo,
  onDecidir,
  onVoltar,
  onAbrir,
  prefs,
}: {
  evento: Evento
  proximo?: Evento
  onDecidir: (id: string, status: 'confirmado' | 'descartado', observacao: string, infracoes?: Tipo[]) => void
  onVoltar: () => void
  onAbrir: (id: string) => void
  prefs: Preferencias
}) {
  const [obs, setObs] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const pendente = evento.status === 'novo'
  const detectadas = infracoesDe(evento)
  // alertas de bloqueio só registram a revisão; os demais podem gerar um ou mais autos
  const autuavel = detectadas.some((t) => GERA_AUTO[t])
  const multas = detectadas.filter((t) => GERA_AUTO[t])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-4">
        <Evidence key={evento.id} evento={evento} autoplay={prefs.autoplay} mostrarMarcacoes={prefs.mostrarMarcacoes} />
        <section className="glass rounded-[20px] p-5">
          <h2 className="text-[13.5px] font-medium text-fg">Descrição do alerta</h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-fg-soft">{evento.descricao}</p>
          <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-fg-mute">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {porConsulta(evento)
              ? 'Restrição comprovada pela consulta à base; a autuação só sai com a aprovação do operador. A foto é de exemplo e a consulta é simulada.'
              : `Situação para análise humana, não uma infração comprovada. ${evento.video ? 'A evidência é um vídeo de exemplo' : evento.marcacao ? 'A foto é de exemplo' : 'A imagem é ilustrativa'} e a confiança é um valor simulado.`}
          </p>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-7 lg:self-start">
        <section className="glass relative overflow-hidden rounded-[20px] p-5">
          <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-accent opacity-20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <AnelConfianca valor={evento.confianca} />
            <div>
              {porConsulta(evento) ? (
                <>
                  <div className="text-[11.5px] text-fg-mute">Consulta à base (simulada)</div>
                  <div className="mt-0.5 text-[15px] font-medium text-fg">Restrição confirmada</div>
                  <div className="mt-1 text-[11.5px] leading-snug text-fg-mute">A placa consta com licenciamento vencido no cadastro. Cabe ao operador só aprovar a autuação.</div>
                </>
              ) : (
                <>
                  <div className="text-[11.5px] text-fg-mute">Confiança simulada</div>
                  <div className="mt-0.5 text-[15px] font-medium text-fg">Grau de certeza do alerta</div>
                  <div className="mt-1 text-[11.5px] leading-snug text-fg-mute">Valor fictício, usado apenas para priorizar a revisão.</div>
                </>
              )}
            </div>
          </div>
          <dl className="relative mt-4 grid grid-cols-2 gap-2">
            <Dado icone={<Tag className="size-3.5" />} rotulo={detectadas.length > 1 ? `${detectadas.length} infrações detectadas` : 'Tipo'} largo={detectadas.length > 1}>
              {detectadas.length > 1 ? (
                <span className="mt-0.5 flex flex-wrap gap-1.5">
                  {detectadas.map((t) => (
                    <TipoBadge key={t} tipo={t} />
                  ))}
                </span>
              ) : (
                TIPO_LABEL[evento.tipo]
              )}
            </Dado>
            <Dado icone={<CircleCheck className="size-3.5" />} rotulo="Status">
              <StatusBadge status={evento.status} className="text-[11.5px]" />
            </Dado>
            <Dado icone={<Calendar className="size-3.5" />} rotulo="Data">
              {formatarData(evento.data)}
            </Dado>
            <Dado icone={<Clock className="size-3.5" />} rotulo="Horário">
              <span className="tabular-nums">{evento.horario}</span>
            </Dado>
            <Dado icone={<Cctv className="size-3.5" />} rotulo="Câmera">
              <span className="tracking-wide tabular-nums">{evento.camera}</span>
            </Dado>
            <Dado icone={<Timer className="size-3.5" />} rotulo="Duração">
              {formatarDuracao(evento.duracaoSegundos)}
            </Dado>
            <Dado icone={<MapPin className="size-3.5" />} rotulo="Local" largo>
              {evento.local}
            </Dado>
            {evento.placa && (
              <Dado icone={<Tag className="size-3.5" />} rotulo="Placa lida" largo>
                <span className="mt-1 flex flex-wrap items-center gap-3">
                  <PlacaMercosul placa={evento.placa} />
                  <span className="text-[12px] leading-snug">
                    <span className="block font-semibold text-autuado">Licenciamento vencido</span>
                    <span className="block text-fg-mute">Último licenciamento: {evento.ultimoLicenciamento} · consulta simulada</span>
                  </span>
                </span>
              </Dado>
            )}
            <Dado icone={<Scale className="size-3.5" />} rotulo="Enquadramento" largo>
              {detectadas.map((t) => (
                <span key={t} className="block">
                  {ENQUADRAMENTO[t].artigo} · {ENQUADRAMENTO[t].gravidade.toLowerCase()}
                </span>
              ))}
            </Dado>
          </dl>
        </section>

        {autosDe(evento).length > 0 ? (
          <AutoInfracao evento={evento} proximo={proximo} onAbrir={onAbrir} onVoltar={onVoltar} />
        ) : pendente ? (
          <section className="glass rounded-[20px] p-5" aria-labelledby="decisao-titulo">
            <div className="text-[11.5px] text-fg-mute">{autuavel ? 'Aguardando aprovação' : 'Aguardando decisão'}</div>
            <h2 id="decisao-titulo" className="mt-0.5 text-[18px] font-medium text-fg">
              {autuavel ? (multas.length > 1 ? `${multas.length} infrações detectadas` : 'Infração detectada') : 'Decisão do operador'}
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-fg-soft">
              {!autuavel
                ? 'Analise a evidência e confirme ou descarte o alerta.'
                : porConsulta(evento)
                  ? 'A consulta à base confirmou a restrição. Aprove ou recuse a multa.'
                  : `O sistema detectou ${multas.length > 1 ? 'estas infrações' : 'esta infração'} na imagem. Revise a evidência e aprove ou recuse a multa.`}
            </p>

            {autuavel && <InfracoesDetectadas infracoes={multas} />}

            <label htmlFor="observacao" className="mt-4 flex items-baseline justify-between text-[12px] text-fg-soft">
              <span>
                Observação <span className="text-fg-mute">(opcional)</span>
              </span>
              <span className={`text-[11px] tabular-nums ${obs.length >= OBSERVACAO_MAX ? 'text-signal' : 'text-fg-mute'}`}>
                {obs.length}/{OBSERVACAO_MAX}
              </span>
            </label>
            <textarea
              id="observacao"
              value={obs}
              maxLength={OBSERVACAO_MAX}
              onChange={(e) => setObs(e.target.value.slice(0, OBSERVACAO_MAX))}
              rows={2}
              placeholder={EXEMPLO_OBS[evento.tipo]}
              className="mt-1.5 w-full resize-none rounded-2xl bg-black/[0.16] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-fg ring-1 ring-inset ring-white/[0.07] outline-none placeholder:text-fg-mute focus:ring-2 focus:ring-white/40"
            />

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Button
                variante="confirmar"
                tamanho="lg"
                icone={<Check className="size-4" strokeWidth={2.6} />}
                onClick={() => (autuavel && prefs.confirmarAprovacao ? setConfirmando(true) : onDecidir(evento.id, 'confirmado', obs.trim(), autuavel ? multas : undefined))}
              >
                {!autuavel ? 'Confirmar evento' : multas.length > 1 ? `Aprovar multas (${multas.length})` : 'Aprovar multa'}
              </Button>
              <Button variante="descartar" tamanho="lg" icone={<Ban className="size-4" />} onClick={() => onDecidir(evento.id, 'descartado', obs.trim())}>
                {autuavel ? (multas.length > 1 ? 'Recusar multas' : 'Recusar multa') : 'Descartar alerta'}
              </Button>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-fg-mute">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {autuavel
                ? `Ao aprovar, o sistema gera ${multas.length > 1 ? 'um auto de infração simulado por infração' : 'o auto de infração simulado'}. Nada é enviado a órgão público.`
                : 'Confirmar registra apenas a revisão humana: não gera multa nem encaminhamento a órgão público.'}
            </p>
          </section>
        ) : (
          <section className="glass animate-rise relative overflow-hidden rounded-[20px] p-5" aria-live="polite">
            <span
              aria-hidden
              className={`pointer-events-none absolute -right-10 -top-12 size-36 rounded-full opacity-30 blur-3xl ${evento.status === 'confirmado' ? 'bg-confirmado' : 'bg-descartado'}`}
            />
            <div className="relative flex items-center gap-3">
              <span
                className={`grid size-11 place-items-center rounded-full ring-1 ring-inset ring-white/10 ${
                  evento.status === 'confirmado' ? 'bg-confirmado/20 text-confirmado' : 'bg-white/[0.1] text-descartado'
                }`}
              >
                {evento.status === 'confirmado' ? <CircleCheck className="size-6" /> : <CircleX className="size-6" />}
              </span>
              <div>
                <h2 className="text-[17px] font-medium text-fg">{evento.status === 'confirmado' ? 'Evento confirmado' : autuavel ? 'Multa recusada' : 'Alerta descartado'}</h2>
                <p className="text-[12px] text-fg-mute">
                  {evento.decididoEm ? `Decisão registrada nesta sessão às ${evento.decididoEm}` : 'Decisão já registrada na base inicial'}
                </p>
              </div>
            </div>

            <div className="relative mt-4 rounded-2xl bg-black/[0.14] p-3.5 ring-1 ring-inset ring-white/[0.06]">
              <div className="text-[11px] text-fg-mute">Observação</div>
              <p className={`mt-1 text-[13.5px] leading-relaxed ${evento.observacao ? 'text-fg' : 'italic text-fg-mute'}`}>{evento.observacao || 'Nenhuma observação registrada.'}</p>
            </div>

            <div className="relative mt-4 space-y-2">
              {proximo ? (
                <Button variante="primario" tamanho="lg" className="w-full" onClick={() => onAbrir(proximo.id)} icone={<SkipForward className="size-4" />}>
                  Revisar próximo pendente
                  <span className="text-[12px] opacity-60">{proximo.id}</span>
                </Button>
              ) : (
                <p className="rounded-2xl bg-confirmado/10 px-3.5 py-3 text-center text-[13px] font-medium text-confirmado ring-1 ring-inset ring-confirmado/25">
                  Todos os alertas foram revisados.
                </p>
              )}
              <Button variante="neutro" tamanho="lg" className="w-full" onClick={onVoltar} icone={<ArrowLeft className="size-4" />}>
                Voltar à lista
              </Button>
            </div>
          </section>
        )}
      </aside>
      <Modal aberto={confirmando} titulo={multas.length > 1 ? `Aprovar ${multas.length} multas?` : 'Aprovar multa?'} onFechar={() => setConfirmando(false)}>
        <p className="text-[13px] leading-relaxed text-fg-soft">
          Ao aprovar, o sistema emite {multas.length > 1 ? 'um auto de infração simulado para cada infração' : 'o auto de infração simulado'} do alerta{' '}
          <span className="font-semibold text-fg tabular-nums">{evento.id}</span>.
        </p>
        <ul className="mt-3 space-y-1.5">
          {multas.map((t) => (
            <li key={t} className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.16] px-3 py-2 text-[12.5px] ring-1 ring-inset ring-white/[0.07]">
              <span className="text-fg">{TIPO_LABEL[t]}</span>
              <span className="whitespace-nowrap font-semibold text-fg tabular-nums">{formatarReais(ENQUADRAMENTO[t].valor)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Button variante="neutro" onClick={() => setConfirmando(false)}>
            Cancelar
          </Button>
          <Button
            variante="confirmar"
            icone={<Check className="size-4" strokeWidth={2.6} />}
            onClick={() => {
              setConfirmando(false)
              onDecidir(evento.id, 'confirmado', obs.trim(), multas)
            }}
          >
            {multas.length > 1 ? 'Aprovar multas' : 'Aprovar multa'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
