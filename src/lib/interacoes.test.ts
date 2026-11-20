// Testes das funções puras de src/lib/interacoes.ts.
// Rodar com: npm test (Node 22.18 ou superior; em versões anteriores use --experimental-strip-types).
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { avaliarSenha } from './interacoes.ts'

test('campo vazio não mostra força da senha', () => {
  assert.equal(avaliarSenha(''), null)
})

test('senha curta e sem variedade é muito fraca', () => {
  const forca = avaliarSenha('abc')
  assert.equal(forca?.pontos, 0)
  assert.equal(forca?.rotulo, 'Muito fraca')
})

test('só 8 caracteres já sobe um nível', () => {
  assert.equal(avaliarSenha('abcdefgh')?.rotulo, 'Fraca')
})

test('8 caracteres com número chegam a razoável', () => {
  assert.equal(avaliarSenha('abcdefg1')?.rotulo, 'Razoável')
})

test('só maiúsculas não conta como mistura de caixas', () => {
  assert.equal(avaliarSenha('ABCDEFGH1')?.pontos, 2)
})

test('maiúsculas e minúsculas com número chegam a boa', () => {
  assert.equal(avaliarSenha('Abcdefg1')?.rotulo, 'Boa')
})

test('acrescentar um símbolo chega a forte', () => {
  assert.equal(avaliarSenha('Abcdefg1!')?.rotulo, 'Forte')
})

test('senha longa sem símbolo também conta como um critério extra', () => {
  assert.equal(avaliarSenha('abcdefghijkl')?.pontos, 2)
})
