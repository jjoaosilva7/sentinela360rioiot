import base from './data/eventos.json'

export type Tipo = 'bloqueio_cruzamento' | 'celular' | 'cinto' | 'caminhao_esquerda' | 'nao_licenciado'
export type Status = 'novo' | 'confirmado' | 'descartado'

export interface Marcacao {
  x: number
  y: number
  w: number
  h: number
}

/** Marcação adicional na mesma imagem (ex.: celular + cinto, ou outra placa lida). */
export interface MarcacaoInfracao extends Marcacao {
  tipo: Tipo
  /** Texto próprio da etiqueta (ex.: "PLACA RJM8A42 · LICENCIAMENTO OK"). */
  rotulo?: string
  /** Leitura sem infração: desenhada em cor neutra. */
  neutra?: boolean
}

export interface Evento {
  id: string
  tipo: Tipo
  data: string
  horario: string
  camera: string
  local: string
  confianca: number
  status: Status
  duracaoSegundos: number
  descricao: string
  imagem: string
  /** Nome do vídeo em src/assets/videos (opcional). A `imagem` serve de capa. */
  video?: string
  /** Placa lida pela câmera (fictícia), usada em veículo não licenciado. */
  placa?: string
  /** Ano do último licenciamento retornado pela consulta simulada. */
  ultimoLicenciamento?: number
  /** Retângulo da infração principal na foto, em % da largura/altura. */
  marcacao?: Marcacao | null
  /** Infrações detectadas na mesma captura. Sem o campo, vale só `tipo`. */
  infracoes?: Tipo[]
  /** Marcações das infrações além da principal. */
  marcacoesExtras?: MarcacaoInfracao[]
  /** Infrações aprovadas pelo operador (cada uma gera um auto). */
  infracoesConfirmadas?: Tipo[]
  /** Preenchidos apenas quando a decisão é tomada durante a demonstração. */
  observacao?: string
  decididoEm?: string
}


export const TIPO_LABEL: Record<Tipo, string> = {
  bloqueio_cruzamento: 'Bloqueio de cruzamento',
  celular: 'Uso de celular ao volante',
  cinto: 'Falta de cinto de segurança',
  caminhao_esquerda: 'Caminhão na faixa da esquerda',
  nao_licenciado: 'Veículo não licenciado',
}

/** Rótulo curto, para filtros e espaços estreitos. */
export const TIPO_CURTO: Record<Tipo, string> = {
  bloqueio_cruzamento: 'Bloqueio',
  celular: 'Celular',
  cinto: 'Cinto',
  caminhao_esquerda: 'Caminhão',
  nao_licenciado: 'Licenciamento',
}

export const TIPOS: Tipo[] = ['bloqueio_cruzamento', 'celular', 'cinto', 'caminhao_esquerda', 'nao_licenciado']

/**
 * Todos os alertas passam pelo operador.
 * Nestes tipos, a confirmação gera um auto de infração simulado.
 */
/** Infrações registradas na captura (a principal primeiro). */
export const infracoesDe = (e: Evento): Tipo[] => e.infracoes ?? [e.tipo]

/** "Uso de celular ao volante" ou, com mais de uma infração, "Celular + Cinto". */
export const rotuloInfracoes = (e: Evento) => {
  const t = infracoesDe(e)
  return t.length > 1 ? t.map((x) => TIPO_CURTO[x]).join(' + ') : TIPO_LABEL[t[0]]
}

/**
 * Infrações comprovadas por consulta a uma base (não por análise de imagem).
 * Se a placa tem restrição, a certeza é total: o operador só aprova a autuação.
 */
export const POR_CONSULTA: Record<Tipo, boolean> = {
  bloqueio_cruzamento: false,
  celular: false,
  cinto: false,
  caminhao_esquerda: false,
  nao_licenciado: true,
}

export const porConsulta = (e: Evento) => infracoesDe(e).every((t) => POR_CONSULTA[t])

/** Infrações que viraram auto de infração após a confirmação do operador. */
export const autosDe = (e: Evento): Tipo[] =>
  e.status === 'confirmado' ? (e.infracoesConfirmadas ?? infracoesDe(e)).filter((t) => GERA_AUTO[t]) : []

export const GERA_AUTO: Record<Tipo, boolean> = {
  bloqueio_cruzamento: false,
  celular: true,
  cinto: true,
  caminhao_esquerda: true,
  nao_licenciado: true,
}

export interface Enquadramento {
  artigo: string
  infracao: string
  gravidade: 'Média' | 'Grave' | 'Gravíssima'
  pontos: number
  valor: number
}

/** Referências do Código de Trânsito Brasileiro (valores de referência, uso demonstrativo). */
export const ENQUADRAMENTO: Record<Tipo, Enquadramento> = {
  bloqueio_cruzamento: {
    artigo: 'CTB, art. 182, VI',
    infracao: 'Parar na área de cruzamento, prejudicando a circulação',
    gravidade: 'Média',
    pontos: 4,
    valor: 130.16,
  },
  celular: {
    artigo: 'CTB, art. 252, parágrafo único',
    infracao: 'Dirigir segurando ou manuseando telefone celular',
    gravidade: 'Gravíssima',
    pontos: 7,
    valor: 293.47,
  },
  cinto: {
    artigo: 'CTB, art. 167',
    infracao: 'Deixar o condutor de usar o cinto de segurança',
    gravidade: 'Grave',
    pontos: 5,
    valor: 195.23,
  },
  caminhao_esquerda: {
    artigo: 'CTB, art. 185, II',
    infracao: 'Deixar de manter veículo lento e de maior porte nas faixas da direita',
    gravidade: 'Média',
    pontos: 4,
    valor: 130.16,
  },
  nao_licenciado: {
    artigo: 'CTB, art. 230, V',
    infracao: 'Conduzir veículo que não esteja registrado e devidamente licenciado',
    gravidade: 'Gravíssima',
    pontos: 7,
    valor: 293.47,
  },
}

export const STATUS_LABEL: Record<Status, string> = {
  novo: 'Novo',
  confirmado: 'Confirmado',
  descartado: 'Descartado',
}

export const OBSERVACAO_MAX = 180

export type FiltroTipo = 'todos' | Tipo
/** 'autuado' = confirmado com auto de infração gerado. */
export type FiltroStatus = 'todos' | Status | 'autuado'
/** 'recentes' = do mais recente ao mais antigo (17:21 → 08:22); 'antigos' = o contrário. */
export type Ordem = 'recentes' | 'antigos'
export type Visao = 'grade' | 'lista'

export interface Filtros {
  busca: string
  tipo: FiltroTipo
  status: FiltroStatus
  ordem: Ordem
}

export const FILTROS_INICIAIS: Filtros = { busca: '', tipo: 'todos', status: 'todos', ordem: 'recentes' }

/** Operador da central (conta de demonstração, sem backend). */
export interface Usuario {
  nome: string
  email: string
  matricula: string
  cargo: string
  unidade: string
  telefone: string
}

export const USUARIO_DEMO: Usuario = {
  nome: 'Carla Menezes',
  email: 'operador@sentinela360.rio',
  matricula: 'RJ-48213',
  cargo: 'Agente de trânsito',
  unidade: 'Centro de Operações · Sentinela 360',
  telefone: '(21) 98765-4321',
}

export const SENHA_DEMO = 'demo1234'

/** Preferências da central; cada uma altera o comportamento do app. */
export interface Preferencias {
  visaoPadrao: Visao
  ordemPadrao: Ordem
  autoplay: boolean
  mostrarMarcacoes: boolean
  confirmarAprovacao: boolean
  contadorSino: boolean
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  visaoPadrao: 'grade',
  ordemPadrao: 'recentes',
  autoplay: true,
  mostrarMarcacoes: true,
  confirmarAprovacao: true,
  contadorSino: true,
}

export const iniciais = (nome: string) =>
  nome
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

// Mídias embutidas no código (data URI): não dependem de requisição separada,
// então aparecem mesmo em pré-visualizações que bloqueiam o carregamento de arquivos.
const fotos = import.meta.glob<string>('./assets/capturas/*.{jpg,jpeg,png,webp,svg}', { eager: true, query: '?inline', import: 'default' })
const videos = import.meta.glob<string>('./assets/videos/*.{mp4,webm}', { eager: true, query: '?inline', import: 'default' })
const urlDaFoto = (arquivo: string) => fotos[`./assets/capturas/${arquivo}`] ?? arquivo
const urlDoVideo = (arquivo?: string) => (arquivo ? videos[`./assets/videos/${arquivo}`] : undefined)

/** No JSON, `imagem` e `video` guardam só o nome do arquivo. */
export const eventosIniciais = (base as Evento[]).map((e) => ({
  ...e,
  imagem: urlDaFoto(e.imagem),
  video: urlDoVideo(e.video),
  // restrição confirmada na base = 100% de certeza
  confianca: porConsulta(e) ? 1 : e.confianca,
}))
