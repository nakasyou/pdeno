export const getCacheDir = async (denoPath?: string) => {
  if (!denoPath) {
    denoPath = 'deno'
  }
  const spawn = new Deno.Command(denoPath, {
    args: ['info']
  })
  const output = await spawn.output()
  const outputText = new TextDecoder().decode(output.stdout)
  return outputText
    .split('\n')
    .filter(line => line.includes('DENO_DIR location'))[0]
    .replace(/^.+? .+? /, '')
}