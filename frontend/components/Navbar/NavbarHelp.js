import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Icon, alertUserV2 } from '../../elements'
import { createBlobCache, fetchHelpText } from '../../elements/help/helpFiles'
import { downloadText } from '../../elements/help/helpExport'
import {
  CORE_MODULE, figureResolver, getHelpIndexVersion, guideTitle, guidesForRoute, loadDocIndex,
  loadGuideFigures, loadHelpModules, moduleIdFromPath, subscribeHelpIndex
} from '../../elements/help/routeGuides'
import { parseFrontMatter } from '../MarkdownEditor/frontMatter'
import { collectImageNames } from '../MarkdownEditor/renderMarkdown'
import MarkdownPreview from '../MarkdownEditor/MarkdownPreview'
import { openGuideWindow, openHelpWindow, renderGuideWindow } from './helpWindow'

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
  const [doc, setDoc] = useState({ raw: '', body: '', images: {}, loading: false, failed: false })
  const [zoom, setZoom] = useState(null)
  const [toc, setToc] = useState([])
  const [showToc, setShowToc] = useState(false)
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
          const records = await loadDocIndex(svSession, owner.objectId)
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
      setDoc({ raw: '', body: '', images: {}, loading: true, failed: false })
      try {
        // The stored file keeps its routing metadata in a leading --- fence so it survives a
        // download/upload round trip. The reader has already used that metadata to find this
        // document, so only the body is rendered; marked would otherwise show the fence as a rule
        // followed by the raw keys.
        const raw = await fetchHelpText(svSession, active)
        const { body } = parseFrontMatter(raw)
        if (cancelled) return

        const images = await loadGuideFigures(svSession, active, collectImageNames(body), cache.current)
        if (!cancelled) setDoc({ raw, body, images, loading: false, failed: false })
      } catch (err) {
        console.error(err)
        if (!cancelled) setDoc({ raw: '', body: '', images: {}, loading: false, failed: true })
      }
    }

    load()
    return () => { cancelled = true }
  }, [active, svSession])

  const resolveImage = useMemo(() => figureResolver(doc.images), [doc.images])

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

  const saveGuide = useCallback((record, text) => {
    downloadText(record.fileName, text)
  }, [])

  const windowOptions = useCallback((record, body, autoPrint) => ({
    title: guideTitle(record),
    body,
    resolveImage,
    autoPrint,
    labels: { print: fmt('perun.help_panel.print'), download: fmt('perun.help_panel.download') },
    onDownload: () => saveGuide(record, doc.raw),
  }), [resolveImage, fmt, saveGuide, doc.raw])

  const openWindow = useCallback((autoPrint = false) => {
    if (!active) return
    if (!openHelpWindow(active, windowOptions(active, doc.body, autoPrint))) blocked()
  }, [active, doc.body, windowOptions, blocked])

  /**
   * Print or download a guide from the list, where its body has not been fetched.
   *
   * The window is opened first and filled once the text arrives, because a popup is only permitted
   * inside the click that asked for it; awaiting the fetch first would put window.open outside the
   * gesture and get it blocked.
   */
  const actOnGuide = useCallback(async (event, record, action) => {
    event.stopPropagation()
    const win = action === 'print' ? openGuideWindow(record, fmt('perun.help_panel.loading')) : null
    if (action === 'print' && !win) { blocked(); return }

    try {
      const raw = await fetchHelpText(svSession, record)
      const { body } = parseFrontMatter(raw)
      if (action !== 'print') {
        saveGuide(record, raw)
        return
      }

      const images = await loadGuideFigures(svSession, record, collectImageNames(body), cache.current)
      renderGuideWindow(win, {
        title: guideTitle(record),
        body,
        resolveImage: figureResolver(images),
        autoPrint: true,
        labels: { print: fmt('perun.help_panel.print'), download: fmt('perun.help_panel.download') },
        onDownload: () => saveGuide(record, raw),
      })
    } catch (err) {
      console.error(err)
      win?.close()
      alertUserV2({ type: 'error', title: fmt('perun.help_panel.failed') })
    }
  }, [svSession, fmt, blocked, saveGuide])

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
            {active && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={() => openWindow(true)}
                title={fmt('perun.help_panel.print')}
                aria-label={fmt('perun.help_panel.print')}
              >
                <Icon name='IconPrinter' size={17} stroke={1.6} />
              </button>
            )}
            {active && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={() => saveGuide(active, doc.raw)}
                title={fmt('perun.help_panel.download')}
                aria-label={fmt('perun.help_panel.download')}
              >
                <Icon name='IconDownload' size={17} stroke={1.6} />
              </button>
            )}
            {active && !doc.loading && !doc.failed && (
              <button
                className='help-panel-window-btn'
                onClick={() => openWindow(false)}
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
                      <Icon name='IconFileText' size={18} />
                      <span>{guideTitle(guide)}</span>
                    </button>
                    <span className='help-panel-list-actions'>
                      <button
                        onClick={(event) => actOnGuide(event, guide, 'print')}
                        title={fmt('perun.help_panel.print')}
                        aria-label={fmt('perun.help_panel.print')}
                      >
                        <Icon name='IconPrinter' size={16} stroke={1.6} />
                      </button>
                      <button
                        onClick={(event) => actOnGuide(event, guide, 'download')}
                        title={fmt('perun.help_panel.download')}
                        aria-label={fmt('perun.help_panel.download')}
                      >
                        <Icon name='IconDownload' size={16} stroke={1.6} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {active && doc.loading && <p className='help-panel-note'>{fmt('perun.help_panel.loading')}</p>}
            {active && doc.failed && <p className='help-panel-note'>{fmt('perun.help_panel.failed')}</p>}
            {active && !doc.loading && !doc.failed && (
              <MarkdownPreview markdown={doc.body} resolveImage={resolveImage} className='help-panel-md' />
            )}
          </div>
          </div>
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
