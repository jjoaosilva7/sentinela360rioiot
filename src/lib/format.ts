import { TIPO_LABEL, autosDe, infracoesDe, type Evento, type Filtros } from '../types'

export const formatarData = (iso: string) => {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

export const formatarConfianca = (c: number) => `${Math.round(c * 100)}%`

export const formatarDuracao = (s: number) => {
  if (s < 60) return `${s} s`
  const min = Math.floor(s / 60)
  const resto = s % 60
  return resto ? `${min} min ${resto} s` : `${min} min`
}

export const relogio = (s: number) => {
  const t = Math.floor(s)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/** Soma segundos a um horário HH:MM:SS. */
export const somarSegundos = (horario: string, s: number) => {
  const [h, m, sec] = horario.split(':').map(Number)
  const total = (h * 3600 + m * 60 + sec + Math.floor(s)) % 86400
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map((n) => String(n).padStart(2, '0')).join(':')
}

export const normalizar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const chaveTempo = (e: Evento) => `${e.data}T${e.horario}`

export const ordenarRecentes = (lista: Evento[]) => [...lista].sort((a, b) => chaveTempo(b).localeCompare(chaveTempo(a)))

/** Ordem do relógio: o que aconteceu primeiro vem primeiro (fila de revisão). */
export const ordenarCronologico = (lista: Evento[]) => [...lista].sort((a, b) => chaveTempo(a).localeCompare(chaveTempo(b)))

export function aplicarFiltros(eventos: Evento[], f: Filtros) {
  // cada termo da busca precisa aparecer em algum campo (ID, câmera, local ou tipo)
  const termos = normalizar(f.busca).split(/\s+/).filter(Boolean)
  const filtrados = eventos.filter((e) => {
    if (f.tipo !== 'todos' && !infracoesDe(e).includes(f.tipo)) return false
    if (f.status === 'autuado') {
      if (autosDe(e).length === 0) return false
    } else if (f.status !== 'todos' && e.status !== f.status) return false
    if (!termos.length) return true
    const alvo = normalizar([e.id, e.camera, e.local, e.placa ?? '', ...infracoesDe(e).map((t) => TIPO_LABEL[t])].join(' '))
    return termos.every((t) => alvo.includes(t))
  })
  return f.ordem === 'antigos' ? ordenarCronologico(filtrados) : ordenarRecentes(filtrados)
}

export function resumo(eventos: Evento[]) {
  const novos = eventos.filter((e) => e.status === 'novo').length
  const confirmados = eventos.filter((e) => e.status === 'confirmado').length
  const descartados = eventos.filter((e) => e.status === 'descartado').length
  // cada infração confirmada gera um auto próprio
  const autuados = eventos.reduce((n, e) => n + autosDe(e).length, 0)
  const revisados = confirmados + descartados
  return {
    total: eventos.length,
    novos,
    confirmados,
    descartados,
    autuados,
    revisados,
    percentual: eventos.length ? Math.round((revisados / eventos.length) * 100) : 0,
  }
}

export const formatarReais = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ')

/** Número do auto de infração simulado, derivado do ID do evento (e da ordem, se houver mais de um). */
export const numeroAuto = (e: Evento, ordem?: number) => `AIT-SIM-${e.data.slice(0, 4)}-${e.id.slice(5)}${ordem ? `-${ordem}` : ''}`

/** Próximo alerta novo na ordem da fila (mais recentes primeiro), a partir do atual. */
export function proximoPendente(eventos: Evento[], atualId: string) {
  const fila = ordenarRecentes(eventos)
  const i = fila.findIndex((e) => e.id === atualId)
  for (let k = 1; k <= fila.length; k++) {
    const e = fila[(i + k) % fila.length]
    if (e.status === 'novo' && e.id !== atualId) return e
  }
  return undefined
}
