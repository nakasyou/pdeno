export const mkdirSafe = async (path: string) => {
  try {
    await Deno.mkdir(path)
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error
    }
  }
}
