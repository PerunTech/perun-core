/**
 * Saves text to the reader's machine.
 *
 * Guides download as their stored Markdown, front matter included, which is the form that survives
 * a round trip: the editor parses that fence back into the metadata form on import, so a guide can
 * move between environments as a file.
 */
export const downloadText = (fileName, text, type = 'text/markdown;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Deferred: revoking in the same tick can beat the download starting in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
