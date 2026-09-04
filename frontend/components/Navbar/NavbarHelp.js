import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Icon, alertUserV2 } from '../../elements'
import { PDF_KIND, createBlobCache, fetchHelpText } from '../../elements/help/helpFiles'
import { downloadBlob, downloadGuideArchive, downloadGuidePdf } from '../../elements/help/helpExport'
import {
  CORE_MODULE, figureResolver, getHelpIndexVersion, guideTitle, guidesForRoute, loadGuideIndex,
  loadGuideFigures, loadHelpModules, moduleIdFromPath, subscribeHelpIndex
} from '../../elements/help/routeGuides'
import { parseFrontMatter } from '../MarkdownEditor/frontMatter'
import { collectImageNames } from '../MarkdownEditor/renderMarkdown'
import MarkdownPreview from '../MarkdownEditor/MarkdownPreview'
import Loading from '../Loading/Loading'
import { openHelpWindow } from './helpWindow'

/**
 * Route-aware user guides.
 *
 * The button only exists when the current route actually has a guide, so an empty panel is never
 * reachable and the navbar stays quiet on routes nobody has documented yet.
 */
const WIDTH_KEY = 'perun.help_panel_width'
const DEFAULT_WIDTH = 560

// Bounded by the viewport rather than by constants alone, so a width stored on a wide monitor does
// not leave the drawer wider than the screen it is later opened on.
const clampWidth = (value) => {
  const max = Math.max(280, window.innerWidth - 60)
  const min = Math.min(360, max)
  return Math.min(Math.max(value, min), max)
}

const storedWidth = () => {
  try {
    const saved = Number(window.localStorage.getItem(WIDTH_KEY))
    return saved ? clampWidth(saved) : DEFAULT_WIDTH
  } catch {
    // Private windows and blocked site data throw on access rather than returning null.
    return DEFAULT_WIDTH
  }
}

const rememberWidth = (value) => {
  try { window.localStorage.setItem(WIDTH_KEY, String(value)) } catch { /* not worth reporting */ }
}

const NavbarHelp = (props, context) => {
  const svSession = useSelector(state => state.security.svSession)
  const locale = useSelector(state => state.intl.locale)
  const { pathname } = useLocation()

  const [guides, setGuides] = useState([])
  // Distinct from an empty list: a lookup that failed must not masquerade as a documented-nothing.
  const [indexFailed, setIndexFailed] = useState(false)
  const [indexVersion, setIndexVersion] = useState(getHelpIndexVersion)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [doc, setDoc] = useState({ raw: '', body: '', images: {}, pdfUrl: null, loading: false, failed: false })
  const [zoom, setZoom] = useState(null)
  const [toc, setToc] = useState([])
  const [showToc, setShowToc] = useState(false)
  // One guide at a time: a PDF of a long guide takes a moment to lay out, and a second click
  // while the first is still working would only queue a duplicate download.
  const [exporting, setExporting] = useState(false)
  // The drawer hangs below the navbar rather than over it, so the Help button stays reachable to
  // toggle it shut. The navbar's own height comes from the deployment's stylesheet, so it is
  // measured rather than assumed.
  const [top, setTop] = useState(0)
  const [width, setWidth] = useState(storedWidth)

  const cache = useRef(createBlobCache())
  // Read by the key handler, which must not re-subscribe on every zoom change.
  const zoomRef = useRef(null)
  const tocRef = useRef(false)
  const drawerRef = useRef(null)
  const bodyRef = useRef(null)
  // The heading elements themselves rather than offsets: a figure decoding after the guide renders
  // moves every offset below it, and a live node is always current.
  const headingsRef = useRef([])
  // Where the reader had got to in each guide, keyed by filename so it survives a re-save.
  const scrollMemory = useRef({})
  // Whatever had focus when the drawer opened, so closing it puts the reader back.
  const restoreFocusRef = useRef(null)

  const fmt = useCallback(
    (id) => context.intl.formatMessage({ id, defaultMessage: id }),
    [context.intl]
  )

  useEffect(() => () => cache.current.revokeAll(), [])

  // Saving or deleting a guide in the Admin Console clears the shared index; picking the new
  // version up here is what stops a deleted guide's button from lingering on the screen it was
  // written for.
  useEffect(() => subscribeHelpIndex(setIndexVersion), [])

  /* ------------------------------------------------------------- index -- */

  // The current route's module plus perun-core, which holds the cross-module guides. Both indexes
  // are cached per tab, so this settles to zero requests once a user has visited a module.
  useEffect(() => {
    if (!svSession) return
    let cancelled = false

    const load = async () => {
      try {
        const modules = await loadHelpModules(svSession)
        if (cancelled) return

        const wanted = [moduleIdFromPath(pathname), CORE_MODULE].filter(Boolean)
        const owners = modules.filter(module => wanted.includes(module.id))

        // Records are tagged with the plugin row they came off, so opening one does not have to
        // re-derive its anchor from a lookup table that changes identity on every route change.
        const indexes = await Promise.all(owners.map(async owner => {
          const records = await loadGuideIndex(svSession, owner.objectId)
          return records.map(record => ({ ...record, anchorId: owner.objectId }))
        }))
        if (cancelled) return

        setGuides(guidesForRoute(indexes.flat(), pathname, locale))
        setIndexFailed(false)
      } catch (err) {
        console.error('Could not load the help index', err)
        if (cancelled) return
        // The button stays so the reader can find out why, rather than the feature vanishing with
        // the same silence as a route nobody has documented.
        setGuides([])
        setIndexFailed(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [svSession, pathname, locale, indexVersion])

  // A route change can leave the panel open on a guide that no longer answers here.
  useEffect(() => {
    const stillHere = (guide, current) =>
      guide.fileName === current.fileName && guide.anchorId === current.anchorId
    setActive(current => {
      if (!current) return null
      const match = guides.find(guide => stillHere(guide, current))
      if (!match) return null
      // Same version: keep the object so the body is not refetched. New object id means the guide
      // was saved again, and swapping it in is what pulls the edited content into the open panel.
      return match.objectId === current.objectId ? current : match
    })
  }, [guides])

  /* -------------------------------------------------------------- close -- */

  // No outside-click dismissal: a guide is read while working through the screen it describes, so
  // clicking the very field it is explaining must not close it. Escape and the header button are
  // the ways out, and Escape unwinds the zoom before the drawer.
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (zoomRef.current) setZoom(null)
      else if (tocRef.current) setShowToc(false)
      else setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const measure = () => {
      const navbar = document.querySelector('.perun-navbar')
      setTop(navbar ? Math.max(navbar.getBoundingClientRect().bottom, 0) : 0)
      setWidth(current => clampWidth(current))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [open])

  useEffect(() => { zoomRef.current = zoom }, [zoom])

  useEffect(() => { tocRef.current = showToc }, [showToc])

  useEffect(() => { if (!open) setZoom(null) }, [open])

  // The drawer is not modal, so focus is moved rather than trapped: it lands inside so Escape and
  // the scroll keys reach it, and returns to wherever the reader was when it closes.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement
      drawerRef.current?.focus({ preventScroll: true })
      return
    }
    const previous = restoreFocusRef.current
    restoreFocusRef.current = null
    if (previous?.isConnected) previous.focus({ preventScroll: true })
  }, [open])

  // Reading a manual means leaving to try the step and coming back, so the drawer returns to where
  // it was rather than to the top. Restored once the body is in the DOM.
  useEffect(() => {
    if (!active || doc.loading || doc.failed || !bodyRef.current) return
    bodyRef.current.scrollTop = scrollMemory.current[active.fileName] ?? 0
  }, [active, doc.loading, doc.failed, doc.body])

  // MarkdownPreview appends its fragment from its own effect, and child effects run before the
  // parent's, so the headings are already in the DOM by the time this runs.
  useEffect(() => {
    const body = bodyRef.current
    if (!body || !active || doc.loading || doc.failed) {
      headingsRef.current = []
      setToc([])
      return
    }
    const nodes = [...body.querySelectorAll('.help-panel-md h1, .help-panel-md h2, .help-panel-md h3')]
    headingsRef.current = nodes
    setToc(nodes.map(node => ({ text: node.textContent.trim(), level: Number(node.tagName[1]) })))
  }, [active, doc.body, doc.loading, doc.failed])

  useEffect(() => { setShowToc(false) }, [active])

  const jumpTo = useCallback((index) => {
    const body = bodyRef.current
    const node = headingsRef.current[index]
    if (!body || !node) return
    // Same rebasing as the editor's scroll sync: viewport coordinates onto the scrolled content.
    const base = body.getBoundingClientRect().top - body.scrollTop
    body.scrollTop = Math.max(node.getBoundingClientRect().top - base - 10, 0)
    setShowToc(false)
  }, [])

  const handleBodyScroll = useCallback((event) => {
    if (active) scrollMemory.current[active.fileName] = event.currentTarget.scrollTop
  }, [active])

  /* -------------------------------------------------------------- fetch -- */

  // Only the figures the document actually references are fetched, and only once the reader has
  // opened that document, so an illustrated manual costs nothing until it is read.
  useEffect(() => {
    if (!active) return
    let cancelled = false

    const load = async () => {
      setDoc({ raw: '', body: '', images: {}, pdfUrl: null, loading: true, failed: false })
      try {
        // An uploaded manual is handed over rather than rendered, so nothing is parsed and no
        // figures are looked for: the file carries its own. The blob is fetched here anyway,
        // because downloadFile answers with content-disposition: attachment, so pointing a tab at
        // the endpoint downloads the file instead of showing it. A blob URL is what lets the
        // browser's own viewer open it, and the cache means opening it twice costs one fetch.
        if (active.kind === PDF_KIND) {
          const pdfUrl = await cache.current.get(svSession, active)
          if (!cancelled) setDoc({ raw: '', body: '', images: {}, pdfUrl, loading: false, failed: false })
          return
        }

        // The stored file keeps its routing metadata in a leading --- fence so it survives a
        // download/upload round trip. The reader has already used that metadata to find this
        // document, so only the body is rendered; marked would otherwise show the fence as a rule
        // followed by the raw keys.
        const raw = await fetchHelpText(svSession, active)
        const { body } = parseFrontMatter(raw)
        if (cancelled) return

        const images = await loadGuideFigures(svSession, active, collectImageNames(body), cache.current)
        if (!cancelled) setDoc({ raw, body, images, pdfUrl: null, loading: false, failed: false })
      } catch (err) {
        console.error(err)
        if (!cancelled) setDoc({ raw: '', body: '', images: {}, pdfUrl: null, loading: false, failed: true })
      }
    }

    load()
    return () => { cancelled = true }
  }, [active, svSession])

  const resolveImage = useMemo(() => figureResolver(doc.images), [doc.images])

  // Every use of this is paired with !doc.loading, because `active` flips a render before the fetch
  // for it starts: on its own this would show a manual's chrome over the document still in state.
  const isPdf = active?.kind === PDF_KIND

  // Figures render into a column a few hundred pixels wide, which is unreadable for a screenshot.
  // Delegated rather than bound per image, because the body is replaced wholesale on every render.
  const handleBodyClick = useCallback((event) => {
    setShowToc(false)
    const image = event.target?.closest?.('img[src]')
    if (image) setZoom({ src: image.getAttribute('src'), alt: image.getAttribute('alt') ?? '' })
  }, [])

  /**
   * Drag the drawer's leading edge.
   *
   * The width is written straight to the node while dragging and only committed to state on
   * release: a render per pointermove would rebuild the whole panel, a long guide's markup
   * included, on every frame of the drag.
   */
  const startResize = useCallback((event) => {
    event.preventDefault()
    const drawer = drawerRef.current
    if (!drawer) return

    let next = drawer.getBoundingClientRect().width
    document.body.classList.add('help-resizing')

    const onMove = (move) => {
      next = clampWidth(window.innerWidth - move.clientX)
      drawer.style.width = `${next}px`
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.body.classList.remove('help-resizing')
      setWidth(next)
      rememberWidth(next)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [])

  const resetWidth = useCallback(() => {
    const value = clampWidth(DEFAULT_WIDTH)
    if (drawerRef.current) drawerRef.current.style.width = `${value}px`
    setWidth(value)
    rememberWidth(value)
  }, [])

  const blocked = useCallback(
    () => alertUserV2({ type: 'warning', title: fmt('perun.help_panel.popup_blocked') }),
    [fmt]
  )

  /**
   * Downloads one guide, as a PDF to read or as its source to edit.
   *
   * Both forms want the same two things, the document and the figures it references, so the form
   * only decides which exporter they are handed to.
   */
  const exportGuide = useCallback(async (record, { raw, body, resolve }, form) => {
    setExporting(true)
    try {
      if (form === 'pdf') {
        await downloadGuidePdf(record.fileName, { title: guideTitle(record), body, resolveUrl: resolve })
      } else {
        await downloadGuideArchive(record.fileName, raw, resolve)
      }
    } catch (err) {
      console.error(err)
      alertUserV2({ type: 'error', title: fmt('perun.help_panel.export_failed') })
    } finally {
      setExporting(false)
    }
  }, [fmt])

  /**
   * Saves an uploaded manual as it stands.
   *
   * Nothing is rendered or repacked here, so this is a plain save of the blob the reader already
   * holds rather than anything the exporters need to be involved in.
   */
  const savePdf = useCallback(async () => {
    if (!active || !doc.pdfUrl) return
    try {
      downloadBlob(active.fileName, await (await fetch(doc.pdfUrl)).blob())
    } catch (err) {
      console.error(err)
      alertUserV2({ type: 'error', title: fmt('perun.help_panel.export_failed') })
    }
  }, [active, doc.pdfUrl, fmt])

  const exportActive = useCallback((form) => {
    if (active) exportGuide(active, { raw: doc.raw, body: doc.body, resolve: resolveImage }, form)
  }, [active, doc.raw, doc.body, resolveImage, exportGuide])

  const openWindow = useCallback(() => {
    if (!active) return
    const options = {
      title: guideTitle(active),
      body: doc.body,
      resolveImage,
      actions: [
        { label: fmt('perun.help_panel.download_pdf'), onClick: () => exportActive('pdf') },
        { label: fmt('perun.help_panel.download_source'), onClick: () => exportActive('source') },
      ],
    }
    if (!openHelpWindow(active, options)) blocked()
  }, [active, doc.body, resolveImage, fmt, exportActive, blocked])

  /**
   * Exports a guide straight from the list, where its body has not been fetched yet.
   *
   * The figures are read the same way the panel reads them, so a guide exports identically whether
   * or not it happens to be the one open.
   */
  const actOnGuide = useCallback(async (event, record, form) => {
    event.stopPropagation()
    try {
      const raw = await fetchHelpText(svSession, record)
      const { body } = parseFrontMatter(raw)
      const images = await loadGuideFigures(svSession, record, collectImageNames(body), cache.current)
      await exportGuide(record, { raw, body, resolve: figureResolver(images) }, form)
    } catch (err) {
      console.error(err)
      alertUserV2({ type: 'error', title: fmt('perun.help_panel.export_failed') })
    }
  }, [svSession, fmt, exportGuide])

  const toggle = useCallback(() => {
    setOpen(current => {
      // One guide is the common case, so skip the list and open it directly.
      if (!current && guides.length === 1) setActive(guides[0])
      return !current
    })
  }, [guides])

  const resized = Math.abs(width - clampWidth(DEFAULT_WIDTH)) > 1

  const heading = useMemo(
    () => (active ? guideTitle(active) : fmt('perun.navbar.help')),
    [active, fmt]
  )

  if (!guides.length && !indexFailed && !open) return null

  return (
    <div className='nav-help'>
      {(guides.length > 0 || indexFailed) && (
        <div
          className={`nav-title-help${open ? ' active' : ''}`}
          title={fmt('perun.navbar.help')}
          onClick={toggle}
        >
          <Icon name='IconBook' />
        </div>
      )}

      {/* Always mounted so opening and closing can animate. visibility:hidden in the closed state
          is what keeps its buttons out of the tab order while it is off screen. */}
      <div
        className={`help-panel${open ? ' help-panel--open' : ''}`}
        ref={drawerRef}
        style={{ top, width }}
        tabIndex={-1}
        aria-hidden={!open}
      >
          <div
            className='help-panel-resize'
            role='separator'
            aria-orientation='vertical'
            title={fmt('perun.help_panel.resize')}
            onPointerDown={startResize}
            onDoubleClick={resetWidth}
          />
          <div className='help-panel-header'>
            {active && guides.length > 1 && (
              <button className='help-panel-back' onClick={() => setActive(null)} title={fmt('perun.help_panel.back')}>
                <Icon name='IconChevronLeft' size={20} />
              </button>
            )}
            <p className='help-panel-title'>{heading}</p>
            {isPdf && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={savePdf}
                title={fmt('perun.help_panel.download_manual')}
                aria-label={fmt('perun.help_panel.download_manual')}
              >
                <Icon name='IconDownload' size={17} stroke={1.6} />
              </button>
            )}
            {active && !isPdf && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={() => exportActive('pdf')}
                disabled={exporting}
                title={fmt('perun.help_panel.download_pdf')}
                aria-label={fmt('perun.help_panel.download_pdf')}
              >
                <Icon name='IconFileTypePdf' size={17} stroke={1.6} />
              </button>
            )}
            {active && !isPdf && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={() => exportActive('source')}
                disabled={exporting}
                title={fmt('perun.help_panel.download_source')}
                aria-label={fmt('perun.help_panel.download_source')}
              >
                <Icon name='IconFileZip' size={17} stroke={1.6} />
              </button>
            )}
            {active && !isPdf && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={openWindow}
                title={fmt('perun.help_panel.open_window')}
                aria-label={fmt('perun.help_panel.open_window')}
              >
                <Icon name='IconExternalLink' size={17} stroke={1.6} />
              </button>
            )}
            {active && toc.length > 1 && (
              <button
                className={`help-panel-toc-btn${showToc ? ' is-open' : ''}`}
                onClick={() => setShowToc(value => !value)}
                title={fmt('perun.help_panel.contents')}
                aria-label={fmt('perun.help_panel.contents')}
                aria-expanded={showToc}
              >
                <Icon name='IconList' size={18} stroke={1.6} />
              </button>
            )}
            {resized && (
              <button
                className='help-panel-reset'
                onClick={resetWidth}
                title={fmt('perun.help_panel.reset_width')}
                aria-label={fmt('perun.help_panel.reset_width')}
              >
                <Icon name='IconRestore' size={17} stroke={1.6} />
              </button>
            )}
            <button className='help-panel-close' onClick={() => setOpen(false)} title={fmt('perun.help_panel.close')}>
              <Icon name='IconX' size={20} />
            </button>
          </div>

          <div className='help-panel-main'>
            {showToc && (
              <nav className='help-toc' aria-label={fmt('perun.help_panel.contents')}>
                <ul>
                  {toc.map((item, index) => (
                    <li key={`${index}-${item.text}`} className={`help-toc-l${item.level}`}>
                      <button onClick={() => jumpTo(index)}>{item.text}</button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

          <div
            className='help-panel-body'
            ref={bodyRef}
            onClick={handleBodyClick}
            onScroll={handleBodyScroll}
          >
            {!active && !guides.length && (
              <p className='help-panel-note'>
                {fmt(indexFailed ? 'perun.help_panel.index_failed' : 'perun.help_panel.none')}
              </p>
            )}
            {!active && guides.length > 0 && (
              <ul className='help-panel-list'>
                {guides.map(guide => (
                  <li key={guide.objectId}>
                    <button className='help-panel-list-open' onClick={() => setActive(guide)}>
                      <Icon name={guide.kind === PDF_KIND ? 'IconFileTypePdf' : 'IconFileText'} size={18} />
                      <span>{guideTitle(guide)}</span>
                    </button>
                    <span className='help-panel-list-actions'>
                      <button
                        hidden={guide.kind === PDF_KIND}
                        onClick={(event) => actOnGuide(event, guide, 'pdf')}
                        disabled={exporting}
                        title={fmt('perun.help_panel.download_pdf')}
                        aria-label={fmt('perun.help_panel.download_pdf')}
                      >
                        <Icon name='IconFileTypePdf' size={16} stroke={1.6} />
                      </button>
                      <button
                        hidden={guide.kind === PDF_KIND}
                        onClick={(event) => actOnGuide(event, guide, 'source')}
                        disabled={exporting}
                        title={fmt('perun.help_panel.download_source')}
                        aria-label={fmt('perun.help_panel.download_source')}
                      >
                        <Icon name='IconFileZip' size={16} stroke={1.6} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {active && doc.loading && <p className='help-panel-note'>{fmt('perun.help_panel.loading')}</p>}
            {active && doc.failed && <p className='help-panel-note'>{fmt('perun.help_panel.failed')}</p>}
            {isPdf && !doc.loading && !doc.failed && (
              <div className='help-panel-manual'>
                <span className='help-panel-manual-icon'>
                  <Icon name='IconFileTypePdf' size={34} stroke={1.4} />
                </span>
                <p className='help-panel-note'>{fmt('perun.help_panel.manual_note')}</p>
                <div className='help-panel-manual-actions'>
                  {/* Iconed because the two are one word apart in most locales, and a reader
                      reaching for a manual should not have to read to tell them apart. */}
                  <button className='md-btn md-btn--primary' onClick={() => window.open(doc.pdfUrl, '_blank', 'noopener')}>
                    <Icon name='IconExternalLink' size={15} stroke={1.7} />
                    {fmt('perun.help_panel.open_manual')}
                  </button>
                  <button className='md-btn md-btn--ghost' onClick={savePdf}>
                    <Icon name='IconDownload' size={15} stroke={1.7} />
                    {fmt('perun.help_panel.download_manual')}
                  </button>
                </div>
              </div>
            )}
            {active && !isPdf && !doc.loading && !doc.failed && (
              <MarkdownPreview markdown={doc.body} resolveImage={resolveImage} className='help-panel-md' />
            )}
          </div>
          </div>
          {exporting && <Loading />}
      </div>

      {zoom && (
        <div
          className='help-lightbox'
          role='dialog'
          aria-label={zoom.alt || fmt('perun.help_panel.figure')}
          onClick={() => setZoom(null)}
        >
          <img src={zoom.src} alt={zoom.alt} />
          {zoom.alt && <p className='help-lightbox-caption'>{zoom.alt}</p>}
          <button className='help-lightbox-close' title={fmt('perun.help_panel.close')}>
            <Icon name='IconX' size={22} />
          </button>
        </div>
      )}
    </div>
  )
}

NavbarHelp.contextTypes = {
  intl: PropTypes.object.isRequired
}

export default NavbarHelp
