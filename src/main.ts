import { mkdirSafe } from './utils/mkDirSafe.ts'
import * as path from 'https://deno.land/std@0.208.0/path/mod.ts'
import { downloadDenoDts } from './tasks/downloadDenoDts.ts'

// .pdeno ディレクトリを作成
await mkdirSafe('./.pdeno')
await mkdirSafe('./.pdeno/deno')

await downloadDenoDts()

await Deno.writeTextFile('./.pdeno/nomal.d.ts', `/// <reference path="./deno/lib.deno.unstable.d.ts" />`)
import * as esbuild from 'https://deno.land/x/esbuild/mod.js'
import { getCacheDir } from './utils/get-cache-dir.ts'

const mainFiles: string[] = ['src/main.ts']

const deps: URL[] = []
await esbuild.build({
  entryPoints: mainFiles,
  bundle: true,
  format: 'esm',
  plugins: [
    {
      name: 'Get Deps',
      setup (config) {
        config.onResolve({
          filter: /.+/
        }, args => {
          let url: URL
          try {
            url = new URL(args.path)
          } catch (e) {
            if (!(e instanceof TypeError)) {
              throw e
            }
            return
          }
          if (['http:', 'https:', 'npm:', 'node:'].includes(url.protocol)) {
            deps.push(url)
            return {
              external: true
            }
          }
        })
      }
    }
  ],
  outfile: 'aa'
})
esbuild.stop()

let pdenoCache: {
  deps: string[]
} | undefined
try {
  pdenoCache = JSON.parse(await Deno.readTextFile('./.pdeno/pdeno-cache.json'))
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) {
    throw error
  }
}
if (!pdenoCache) {
  pdenoCache = {
    deps: []
  }
}
const depsSet = new Set([
  ...deps.map(dep => dep.href),
  ...pdenoCache.deps
])
pdenoCache.deps = [...depsSet]
await Deno.writeTextFile('./.pdeno/pdeno-cache.json', JSON.stringify(pdenoCache, null, 2))

const cache = path.join(await getCacheDir(), 'dep_analysis_cache_v1')
const r = await Deno.readTextFile(cache)
await Deno.writeTextFile('a.db', r)