#!/usr/bin/env node

/**
 * Corrige arquivos JSON exportados da API api-sports.io
 * que vêm no formato de objeto JS literal (sem aspas nas chaves, sem vírgulas).
 *
 * Uso: node fix-json.js <arquivo.json> [arquivo2.json ...]
 */

const fs = require('fs')
const path = require('path')

const files = process.argv.slice(2)

if (files.length === 0) {
  console.error('Uso: node fix-json.js <arquivo.json> [arquivo2.json ...]')
  process.exit(1)
}

for (const file of files) {
  const filePath = path.resolve(file)

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`)
    continue
  }

  let text = fs.readFileSync(filePath, 'utf8')

  // Adicionar aspas nas chaves (palavra seguida de :)
  text = text.replace(/^(\s*)(\w+):/gm, '$1"$2":')

  // Adicionar vírgulas entre propriedades
  text = text.replace(/("[^"]*")\n(\s*")/g, '$1,\n$2')
  text = text.replace(/(\d+)\n(\s*")/g, '$1,\n$2')
  text = text.replace(/(true|false)\n(\s*")/g, '$1,\n$2')
  text = text.replace(/(null)\n(\s*")/g, '$1,\n$2')

  // Adicionar vírgulas entre objetos e após fechamento de blocos
  text = text.replace(/\}\n(\s*)\{/g, '},\n$1{')
  text = text.replace(/\}\n(\s*)"/g, '},\n$1"')
  text = text.replace(/\]\n(\s*)"/g, '],\n$1"')

  try {
    const data = JSON.parse(text)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
    const count = data.response ? data.response.length : '?'
    console.log(`✓ ${path.basename(filePath)} — JSON válido (${count} entries)`)
  } catch (err) {
    console.error(`✗ ${path.basename(filePath)} — Erro ao parsear: ${err.message}`)
  }
}
