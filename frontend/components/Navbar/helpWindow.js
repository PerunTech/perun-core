import { renderMarkdown } from '../MarkdownEditor/renderMarkdown'

/**
 * Opens one guide in its own browser window.
 *
 * The window is populated directly rather than pointed at a URL, so it costs nothing: no route, no
 * second boot of the application, no repeated fetch. The nodes come from the same renderer the
 * drawer uses, imported into the new document, so the popup can never drift from the panel.
 *
 * Figures keep working because a window opened on about:blank is same origin, and blob URLs minted
 * by the opener resolve in it. The corollary is that they die with the opening document: a full
 * reload of the application leaves an already-open guide window with broken figures. Reopening it
 * from the drawer fixes that, which is the trade for not booting the app twice.
 */

// The app's own stylesheets are injected as <style> elements by style-loader rather than served as
// files, so they are copied across as text. Nothing in them matches the popup's markup except the
// md-preview rules, which is exactly what is wanted.
const appStyles = () =>
  [...document.querySelectorAll('style')].map(node => node.textContent).join('\n')

// The --md-* tokens are declared on .md-editor and .help-panel, neither of which exists here, so
// the preview rules would resolve to nothing without this. Appended after the app styles so it
// also wins over any global body rule they carry.
const WINDOW_CSS = `
:root {
  --md-bg: #ffffff;
  --md-sunk: #f4f5f6;
  --md-border: #d9dee2;
  --md-text: #1f2a2e;
  --md-muted: #6b787e;
  --md-accent: #87adbd;
  --md-radius: 3px;
}
html, body {
  margin: 0;
  padding: 0;
  background: var(--md-bg);
  color: var(--md-text);
}
.help-window-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: var(--md-sunk);
  border-bottom: 1px solid var(--md-border);
}
.help-window-bar h1 {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.help-window-bar button {
  padding: 4px 12px;
  font-size: 13px;
  color: var(--md-text);
  background: var(--md-bg);
  border: 1px solid var(--md-border);
  border-radius: var(--md-radius);
  cursor: pointer;
}
.help-window-bar button:hover { background: var(--md-sunk); }
.help-window-doc {
  max-width: 72ch;
  margin: 0 auto;
  padding: 28px 24px 64px;
}
.help-window-doc img { max-width: 100%; height: auto; }
.help-window-doc pre, .help-window-doc table { max-width: 100%; overflow-x: auto; }

@media print {
  .help-window-bar { display: none; }
  .help-window-doc { max-width: none; padding: 0; }

  /* A figure taller than the space left on the page is sliced across the break rather than moved
     down, which cuts a screenshot in half. The cap is what actually fixes that: an image that fits
     a page on its own is moved whole instead of split. vh resolves against the page box in paged
     media, so this follows whatever paper the reader picks rather than assuming A4. Made a block
     first, because break-inside has no effect on an inline box. */
  .help-window-doc img {
    display: block;
    max-height: 90vh;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .help-window-doc p { break-inside: avoid; page-break-inside: avoid; }
}
`

/** A window name has to be a token, and one per document keeps two guides from clobbering each other. */
const windowName = (record) =>
  `perun_help_${record?.locale ?? ''}_${record?.slug ?? ''}`.replace(/[^\w]/g, '_')

/**
 * Opens the window and nothing else.
 *
 * Kept separate from filling it because a popup is only allowed to open inside the click that asked
 * for it. Callers that must fetch the guide first open the window here, then render into it when
 * the body arrives; doing the fetch first would put window.open outside the gesture and get it
 * blocked.
 *
 * @returns {Window|null} null when the browser blocked it
 */
export const openGuideWindow = (record, waitingText = '') => {
  const win = window.open('', windowName(record), 'width=780,height=940,scrollbars=yes,resizable=yes')
  if (!win) return null

  win.document.open()
  win.document.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>')
  win.document.close()

  if (waitingText) {
    const note = win.document.createElement('p')
    note.textContent = waitingText
    note.setAttribute('style', 'margin:28px;font:14px system-ui,sans-serif;color:#6b787e')
    win.document.body.appendChild(note)
  }
  win.focus()
  return win
}

/** Resolves once every figure has settled, so an auto-print does not fire on a page of gaps. */
const figuresSettled = (win) => {
  const pending = [...win.document.images].filter(image => !image.complete)
  if (!pending.length) return Promise.resolve()

  return Promise.race([
    Promise.all(pending.map(image => new Promise(done => {
      image.addEventListener('load', done, { once: true })
      image.addEventListener('error', done, { once: true })
    }))),
    new Promise(done => win.setTimeout(done, 3000)),
  ])
}

/**
 * @param {object}   record        the guide being read, for its title and window name
 * @param {string}   title         heading to show in the window's own bar
 * @param {string}   body          markdown, front matter already stripped
 * @param {Function} resolveImage  figure name to object URL
 * @param {object}   labels        { print }
 * @returns {boolean} false when the browser blocked the popup
 */
export const renderGuideWindow = (win, { title, body, resolveImage, labels = {}, autoPrint = false, onDownload }) => {
  if (!win || win.closed) return false

  // Reopening reuses the named window, so it is rewritten from scratch rather than appended to.
  win.document.open()
  win.document.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>')
  win.document.close()

  // Set as a property rather than written into the markup, so a title containing markup characters
  // cannot escape into the document.
  win.document.title = title

  const style = win.document.createElement('style')
  style.textContent = `${appStyles()}\n${WINDOW_CSS}`
  win.document.head.appendChild(style)

  const bar = win.document.createElement('div')
  bar.className = 'help-window-bar'
  const label = win.document.createElement('h1')
  label.textContent = title
  const print = win.document.createElement('button')
  print.type = 'button'
  print.textContent = labels.print ?? 'Print'
  print.addEventListener('click', () => win.print())
  bar.appendChild(label)

  if (onDownload) {
    const download = win.document.createElement('button')
    download.type = 'button'
    download.textContent = labels.download ?? 'Download'
    download.addEventListener('click', onDownload)
    bar.appendChild(download)
  }
  bar.appendChild(print)

  const article = win.document.createElement('article')
  article.className = 'md-preview help-window-doc'
  article.appendChild(win.document.importNode(renderMarkdown(body, resolveImage), true))

  win.document.body.appendChild(bar)
  win.document.body.appendChild(article)
  win.focus()

  if (autoPrint) figuresSettled(win).then(() => { if (!win.closed) win.print() })
  return true
}

/** Open and fill in one step, for callers that already hold the body. */
export const openHelpWindow = (record, options) => {
  const win = openGuideWindow(record)
  return win ? renderGuideWindow(win, options) : false
}
