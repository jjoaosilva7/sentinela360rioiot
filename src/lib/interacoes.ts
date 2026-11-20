// Funções pequenas usadas pelas interações da central.
// Ficam fora dos componentes para poderem ser reaproveitadas e testadas sem abrir a tela.

export interface ForcaSenha {
  pontos: number // de 0 a 4
  rotulo: string
  cor: string // classe Tailwind da barra
  texto: string // classe Tailwind do rótulo
}

const NIVEIS: ForcaSenha[] = [
  { pontos: 0, rotulo: 'Muito fraca', cor: 'bg-autuado', texto: 'text-autuado' },
  { pontos: 1, rotulo: 'Fraca', cor: 'bg-autuado', texto: 'text-autuado' },
  { pontos: 2, rotulo: 'Razoável', cor: 'bg-signal', texto: 'text-signal' },
  { pontos: 3, rotulo: 'Boa', cor: 'bg-accent', texto: 'text-accent' },
  { pontos: 4, rotulo: 'Forte', cor: 'bg-confirmado', texto: 'text-confirmado' },
]

/**
 * Dá uma nota de 0 a 4 à senha: soma um ponto para cada critério cumprido.
 * Devolve null enquanto o campo está vazio (condicional: nada a mostrar).
 */
export function avaliarSenha(senha: string): ForcaSenha | null {
  if (senha.length === 0) return null

  let pontos = 0
  if (senha.length >= 8) pontos += 1 // comprimento mínimo
  if (/\d/.test(senha)) pontos += 1 // tem algum número
  if (senha !== senha.toLowerCase() && senha !== senha.toUpperCase()) pontos += 1 // maiúsculas e minúsculas misturadas
  if (senha.length >= 12 || /[^\p{L}\p{N}]/u.test(senha)) pontos += 1 // senha longa ou com símbolo

  return NIVEIS[pontos]
}

/** Diz se o alvo de um evento de teclado é um campo de digitação. Atalhos não devem disparar enquanto o usuário escreve. */
export function ehCampoDeTexto(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false
  return alvo.isContentEditable || alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.tagName === 'SELECT'
}

/**
 * Copia um texto para a área de transferência. Devolve true se deu certo.
 * Usa a API moderna quando o navegador oferece; senão, cria um <textarea> temporário no DOM e usa o comando antigo de cópia.
 */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto)
      return true
    }

    const area = document.createElement('textarea')
    area.value = texto
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const copiado = document.execCommand('copy')
    document.body.removeChild(area)
    return copiado
  } catch {
    return false
  }
}
