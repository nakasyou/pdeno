import { DENO_DTS_FILES } from '../const/deno-dts-files.ts'
import { PDENO_DENO_DTS_DIR } from '../const/dirs.ts'
import * as fs from 'https://deno.land/std@0.208.0/fs/mod.ts'
import * as path from 'https://deno.land/std@0.208.0/path/mod.ts'

export const downloadDenoDts = async () => {
  const downloadPromises: Promise<void>[] = []
  for (const denoDtsFileUrl of DENO_DTS_FILES) {
    const outPath = path.join(PDENO_DENO_DTS_DIR, denoDtsFileUrl.name)
    if (!await fs.exists(outPath)) {
      downloadPromises.push((async () => {
        const text = await fetch(denoDtsFileUrl.url).then(res => res.text())
        const result = text.replaceAll(/\/\/\/ <reference lib="deno\..+" \/>/g, text => {
          const dtsPath = text.replace('/// <reference lib="', '').replace('" />', "")
          return `/// <reference path="./lib.${dtsPath}.d.ts" />`
        })
        await Deno.writeTextFile(outPath, result)
      })())
    }
  }
  await Promise.all(downloadPromises)
}