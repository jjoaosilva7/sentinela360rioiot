import { LogOut, RotateCcw } from 'lucide-react'
import { Button } from '../components/Button'
import { Interruptor, LinhaConfig, Segmentado } from '../components/Form'
import type { Ordem, Preferencias, Visao } from '../types'

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[20px] px-5 py-4 sm:px-6">
      <h2 className="pt-1 text-[16px] font-semibold text-fg">{titulo}</h2>
      {descricao && <p className="mt-0.5 text-[12.5px] text-fg-mute">{descricao}</p>}
      <div className="mt-2 divide-y divide-white/[0.08]">{children}</div>
    </section>
  )
}

export function Configuracoes({
  prefs,
  onChange,
  onReiniciar,
  onSobre,
  onSair,
}: {
  prefs: Preferencias
  onChange: (p: Preferencias) => void
  onReiniciar: () => void
  onSobre: () => void
  onSair: () => void
}) {
  const set = <K extends keyof Preferencias>(k: K, v: Preferencias[K]) => onChange({ ...prefs, [k]: v })
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <Secao titulo="Fila de revisão" descricao="Como a lista de alertas abre para você.">
        <LinhaConfig rotulo="Visualização padrão" descricao="Cards com foto ou tabela compacta.">
          <Segmentado<Visao>
            rotulo="Visualização padrão"
            valor={prefs.visaoPadrao}
            onChange={(v) => set('visaoPadrao', v)}
            opcoes={[
              { valor: 'grade', label: 'Grade' },
              { valor: 'lista', label: 'Lista' },
            ]}
          />
        </LinhaConfig>
        <LinhaConfig rotulo="Ordenação padrão" descricao="Também é usada ao limpar os filtros.">
          <Segmentado<Ordem>
            rotulo="Ordenação padrão"
            valor={prefs.ordemPadrao}
            onChange={(v) => set('ordemPadrao', v)}
            opcoes={[
              { valor: 'recentes', label: 'Mais recentes' },
              { valor: 'antigos', label: 'Mais antigos' },
            ]}
          />
        </LinhaConfig>
      </Secao>

      <Secao titulo="Evidência" descricao="Como a captura aparece ao abrir um alerta.">
        <Interruptor rotulo="Reproduzir a detecção automaticamente" descricao="A simulação começa ao abrir o alerta e se repete em loop." marcado={prefs.autoplay} onChange={(v) => set('autoplay', v)} />
        <Interruptor rotulo="Mostrar marcações na imagem" descricao="Caixas e etiquetas sobre os veículos e as placas." marcado={prefs.mostrarMarcacoes} onChange={(v) => set('mostrarMarcacoes', v)} />
      </Secao>

      <Secao titulo="Decisão e notificações">
        <Interruptor rotulo="Pedir confirmação antes de aprovar multa" descricao="Mostra o resumo dos autos antes de emiti-los." marcado={prefs.confirmarAprovacao} onChange={(v) => set('confirmarAprovacao', v)} />
        <Interruptor rotulo="Mostrar contador de pendentes no sino" marcado={prefs.contadorSino} onChange={(v) => set('contadorSino', v)} />
      </Secao>

      <Secao titulo="Demonstração">
        <LinhaConfig rotulo="Restaurar base inicial" descricao="Apaga as decisões desta sessão e volta aos alertas originais.">
          <Button variante="neutro" tamanho="sm" icone={<RotateCcw className="size-3.5" />} onClick={onReiniciar}>
            Restaurar
          </Button>
        </LinhaConfig>
        <LinhaConfig rotulo="Sobre o protótipo" descricao="Objetivo, limitações e dados utilizados.">
          <Button variante="neutro" tamanho="sm" onClick={onSobre}>
            Ver detalhes
          </Button>
        </LinhaConfig>
        <LinhaConfig rotulo="Encerrar sessão" descricao="Volta para a tela de login.">
          <Button variante="descartar" tamanho="sm" icone={<LogOut className="size-3.5" />} onClick={onSair}>
            Sair
          </Button>
        </LinhaConfig>
      </Secao>
    </div>
  )
}
