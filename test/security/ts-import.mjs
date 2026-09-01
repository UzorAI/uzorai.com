// test/security/ts-import.mjs — import a self-contained .ts module by value.
//
// The project's own test/build pipeline never runs plain `node script.mjs`
// against TypeScript sources, and the CI Node version is not guaranteed to
// support `--experimental-strip-types`, so these tests can't `import` a .ts
// file directly. `typescript` is already a devDependency and is pure JS (no
// native binary, no network, no postinstall step) — `ts.transpileModule` runs
// in-process to strip types from the source text, and the result (still plain
// ESM `import`/`export` syntax) is written to a temp .mjs file and imported.
//
// This only works for modules with NO import statements of their own
// (transpileModule transpiles syntax; it does not resolve or bundle
// specifiers) — which is exactly why src/server/security.ts is written
// dependency-free, using only the ambient Request/Response/Headers globals.
import ts from 'typescript'
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function importTsModule(absoluteSourcePath) {
  const source = readFileSync(absoluteSourcePath, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absoluteSourcePath,
  })
  const dir = mkdtempSync(join(tmpdir(), 'uzorai-security-test-'))
  const outFile = join(dir, 'module.mjs')
  writeFileSync(outFile, outputText, 'utf8')
  return import(pathToFileURL(outFile).href)
}
