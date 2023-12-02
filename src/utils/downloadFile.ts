export const downloadFile = async (path: string | URL, url: URL | Request | string) => {
  if (typeof url === 'string' || url instanceof URL) {
    url = new Request(url)
  }
  const res =await fetch(url)
  
  const file = await Deno.open(path, {
    write: true,
    create: true
  })
  await res.body?.pipeTo(file.writable)
}
