import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, alertUserV2, alertUserResponse } from '../../../elements'
import { getServerOrigin } from '../../../functions/utils'
import { MarkdownEditor } from '../../MarkdownEditor'
import AdminConsoleHelpButton from './AdminConsoleHelpButton'
import Loading from '../../Loading/Loading'
import {
  HELP_DOC, HELP_IMAGE,
  listHelpFiles, listHelpModules, fetchHelpText, saveHelpDoc, uploadHelpFile,
  newestByName, buildImageName, displayImageName, createBlobCache, docStem, deleteHelpDoc,
} from '../../../elements/help/helpFiles'
import {
  clearHelpIndexCache, figureResolver, loadGuideFigures, ownerModuleForRoute
} from '../../../elements/help/routeGuides'
import { downloadText } from '../../../elements/help/helpExport'
import { openGuideWindow, renderGuideWindow } from '../../Navbar/helpWindow'
import { parseFrontMatter } from '../../MarkdownEditor/frontMatter'
import { collectImageNames } from '../../MarkdownEditor/renderMarkdown'

const { useReducer, useEffect, useRef, useCallback, useMemo } = React

// No trailing blank line: the fence regex consumes one newline after the closing ---, so a second
// one survives as the body and opens the editor on an empty first line. serializeFrontMatter
// writes the blank separator back on save regardless of what the buffer holds.
//
// The route is written in rather than left empty because the schema now defaults the dropdown to
// its first option. A blank here would leave the select showing one route while the metadata said
// another, and the anchor is derived from the metadata, so the guide would be stored under the
// wrong module.
const blankDoc = (route) => `---\nroute: ${route}\ntitle: \norder: 1\n---\n`

const UserGuidesAdmin = (props, context) => {
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id })

  const initialState = {
    loading: true, saving: false,
    modules: [], docs: [], locales: [], editing: null, imageUrls: {},
  }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{ loading, saving, modules, docs, locales, editing, imageUrls }, setState] =
    useReducer(reducer, initialState)

  const cache = useRef(createBlobCache())
  // Object URLs stay alive until revoked, so a section left open would otherwise pin every figure
  // it ever previewed for the life of the tab.
  useEffect(() => {
    const held = cache.current
    return () => held.revokeAll()
  }, [])

  const { svSession } = props

  /** Guides live under each module's own plugin row, so the list is the union across bundles. */
  const loadDocs = useCallback(async (moduleList) => {
    const perModule = await Promise.all(moduleList.map(async (module) => {
      try {
        const records = await listHelpFiles(svSession, module.objectId, HELP_DOC)
        return newestByName(records).map(record => ({ ...record, module: module.id }))
      } catch (err) {
        // One module failing to answer should not blank the whole list.
        console.error(`Could not read guides for ${module.id}`, err)
        return []
      }
    }))
    setState({ docs: perModule.flat() })
  }, [svSession])

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      try {
        const [moduleList, languages] = await Promise.all([
          listHelpModules(svSession),
          fetch(`${getServerOrigin()}${window.assets}/json/config/LanguageOptions.json`)
            .then(res => res.json())
            .catch(() => []),
        ])
        if (cancelled) return

        if (!moduleList.length) {
          setState({ loading: false })
          alertUserV2({ type: 'info', title: fmt('perun.admin_console.user_guides_no_anchor') })
          return
        }

        setState({
          modules: moduleList,
          locales: (languages ?? []).map(item => ({ value: item.language, label: item.label || item.language })),
        })
        await loadDocs(moduleList)
      } catch (err) {
        console.error(err)
        alertUserResponse({ response: err })
      } finally {
        if (!cancelled) setState({ loading: false })
      }
    }

    boot()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svSession, loadDocs])

  const anchorFor = useCallback(
    (moduleId) => modules.find(module => module.id === moduleId)?.objectId ?? null,
    [modules]
  )

  // A guide is only readable from the module that owns its route, so the storage anchor follows the
  // route rather than being chosen. editingModule is what every write below resolves through.
  const editingModule = useMemo(
    () => (editing ? ownerModuleForRoute(editing.route, modules) : null),
    [editing, modules]
  )

  // Route suggestions come from the registered modules plus whatever existing guides already point
  // at, which covers the common cases without a Router change.
  //
  // The path is part of the label rather than only the value: the route is what decides both where
  // a guide is stored and where it answers, so an author choosing between two similar module names
  // is really choosing between two paths and should be able to see them.
  const routes = useMemo(() => {
    const fromModules = modules.map(module => {
      const value = `/main/${module.id}`
      return { value, label: module.title ? `${module.title} (${value})` : value }
    })
    const fromDocs = docs.map(doc => doc.notes?.route).filter(Boolean).map(route => ({ value: route, label: route }))
    const seen = new Set()
    return [...fromModules, ...fromDocs].filter(route => !seen.has(route.value) && seen.add(route.value))
  }, [modules, docs])

  // Figures are fetched only for the module being edited, and only on entering the editor, so
  // opening the section costs one request per module rather than two.
  useEffect(() => {
    if (!editing) return
    const objectId = anchorFor(editingModule)
    if (!objectId) return
    let cancelled = false

    const loadImages = async () => {
      try {
        const records = newestByName(await listHelpFiles(svSession, objectId, HELP_IMAGE))
        if (cancelled) return
        const stem = `${editing.locale}_${editing.slug}`
        const mine = records.filter(img => img.fileName.startsWith(`${stem}__`) || !img.fileName.includes('__'))
        const pairs = await Promise.all(mine.map(async record => [
          displayImageName(record.fileName),
          await cache.current.get(svSession, record),
        ]))
        if (!cancelled) setState({ imageUrls: Object.fromEntries(pairs) })
      } catch (err) {
        console.error(err)
      }
    }

    loadImages()
    return () => { cancelled = true }
  }, [editing, editingModule, svSession, anchorFor])

  const resolveImage = useCallback((name) => imageUrls[name] ?? null, [imageUrls])

  // Called by the editor on save, once per figure the document still references. The editor has
  // already chosen a non-colliding display name and written it into the Markdown, so store under
  // that name rather than the dropped file's own.
  const uploadImage = useCallback(async (file, { locale, slug, name }) => {
    const objectId = anchorFor(editingModule)
    if (!objectId) throw new Error(fmt('perun.admin_console.user_guides_no_anchor'))

    await uploadHelpFile(svSession, {
      objectId,
      fileType: HELP_IMAGE,
      file,
      fileName: buildImageName(`${locale}_${slug}`, name || file.name),
      notes: { doc: `${locale}_${slug}` },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svSession, editingModule, anchorFor])

  /**
   * Print or download one guide from the list.
   *
   * Printing goes through the same standalone window the reader uses, so there is one print surface
   * rather than a print stylesheet fighting the Admin Console's own layout. The window is opened
   * before the fetch because a popup is only allowed inside the click that asked for it.
   */
  const exportDoc = async (event, record, action) => {
    event.stopPropagation()
    const win = action === 'print' ? openGuideWindow(record, fmt('perun.main.loading')) : null
    if (action === 'print' && !win) {
      alertUserV2({ type: 'warning', title: fmt('perun.help_panel.popup_blocked') })
      return
    }

    try {
      const raw = await fetchHelpText(svSession, record)
      if (action !== 'print') {
        downloadText(record.fileName, raw)
        return
      }

      // Figures are fetched for the print the same way the reader fetches them, so a printed guide
      // carries its screenshots instead of a column of gaps.
      const { body } = parseFrontMatter(raw)
      const anchor = { anchorId: anchorFor(record.module), locale: record.locale, slug: record.slug }
      const images = await loadGuideFigures(svSession, anchor, collectImageNames(body), cache.current)

      renderGuideWindow(win, {
        title: record.notes?.title || record.slug,
        body,
        resolveImage: figureResolver(images),
        autoPrint: true,
        labels: { print: fmt('perun.help_panel.print'), download: fmt('perun.help_panel.download') },
        onDownload: () => downloadText(record.fileName, raw),
      })
    } catch (err) {
      console.error(err)
      win?.close()
      alertUserResponse({ response: err })
    }
  }

  // Exports what is on screen rather than what is stored, so an author can print a draft before
  // committing it. The editor hands over the recombined document; nothing here re-reads the store.
  const exportEditing = (action, document, resolveFigure) => {
    const fileName = `${editing.locale}_${editing.slug || 'untitled'}.md`
    if (action !== 'print') {
      downloadText(fileName, document)
      return
    }
    const record = { locale: editing.locale, slug: editing.slug || 'untitled' }
    const win = openGuideWindow(record, fmt('perun.main.loading'))
    if (!win) {
      alertUserV2({ type: 'warning', title: fmt('perun.help_panel.popup_blocked') })
      return
    }
    const { meta, body } = parseFrontMatter(document)
    renderGuideWindow(win, {
      title: meta.title || editing.slug,
      body,
      // The editor's own resolver rather than this one: a figure dropped in this session has not
      // been uploaded yet, and printing the draft has to show it exactly as the preview does.
      resolveImage: resolveFigure ?? resolveImage,
      autoPrint: true,
      labels: { print: fmt('perun.help_panel.print'), download: fmt('perun.help_panel.download') },
      onDownload: () => downloadText(fileName, document),
    })
  }

  const openDoc = async (record) => {
    try {
      setState({ loading: true })
      const markdown = await fetchHelpText(svSession, record)
      setState({
        editing: { value: markdown, locale: record.locale, slug: record.slug, route: record.notes?.route ?? '' },
        imageUrls: {},
        loading: false,
      })
    } catch (err) {
      console.error(err)
      setState({ loading: false })
      alertUserResponse({ response: err })
    }
  }

  const newDoc = () => setState({
    editing: {
      value: blankDoc(routes[0]?.value ?? ''),
      locale: locales[0]?.value ?? '',
      slug: '',
      route: routes[0]?.value ?? '',
    },
    imageUrls: {},
  })

  const handleSave = async ({ document, locale, slug, meta }) => {
    // Derived from the submitted route rather than from state, so a save cannot land on a stale
    // anchor if the route was the last thing edited.
    const module = ownerModuleForRoute(meta.route, modules)
    const objectId = anchorFor(module)
    if (!objectId) return
    try {
      setState({ saving: true })
      await saveHelpDoc(svSession, {
        objectId,
        locale,
        slug,
        markdown: document,
        notes: { route: meta.route, title: meta.title, order: meta.order, locale, module },
      })
      // The navbar reader caches each module's index for the life of the tab, so a fresh save is
      // invisible to it until the cache is dropped.
      clearHelpIndexCache()
      await loadDocs(modules)
      setState({ saving: false, editing: null })
      alertUserV2({ type: 'success', title: fmt('perun.admin_console.saved') })
    } catch (err) {
      console.error(err)
      setState({ saving: false })
      alertUserResponse({ response: err })
    }
  }

  // Deleting removes every stored version plus the document's own figures, so the row cannot come
  // back from history. The row itself opens the editor, hence the stopPropagation.
  const confirmDelete = (event, doc) => {
    event.stopPropagation()
    alertUserV2({
      type: 'warning',
      title: fmt('perun.admin_console.user_guides_delete_title'),
      message: `${doc.notes?.title || doc.slug} (${doc.fileName})`,
      showCancel: true,
      confirmButtonText: fmt('perun.admin_console.user_guides_delete_confirm'),
      cancelButtonText: fmt('perun.help_editor.cancel'),
      confirmButtonColor: '#a3342b',
      onConfirm: () => removeDoc(doc),
    })
  }

  const removeDoc = async (doc) => {
    const objectId = anchorFor(doc.module)
    if (!objectId) return
    try {
      setState({ saving: true })
      await deleteHelpDoc(svSession, { objectId, fileName: doc.fileName })
      clearHelpIndexCache()
      await loadDocs(modules)
      setState({ saving: false })
      alertUserV2({ type: 'success', title: fmt('perun.admin_console.user_guides_deleted') })
    } catch (err) {
      console.error(err)
      setState({ saving: false })
      alertUserResponse({ response: err })
    }
  }

  const title = { id: 'perun.admin_console.user_guides', defaultMessage: 'perun.admin_console.user_guides' }

  const header = (
    <div className='admin-console-component-header'>
      <p>{fmt('perun.admin_console.user_guides')}</p>
      <AdminConsoleHelpButton title={title} />
    </div>
  )

  if (editing) {
    return (
      <React.Fragment>
        {header}
        <div className='user-guides-actions'>
          <button type='button' className='md-btn md-btn--ghost' onClick={() => setState({ editing: null })}>
            <Icon name='IconArrowLeft' size={16} stroke={1.7} />
            <span>{fmt('perun.admin_console.user_guides_back')}</span>
          </button>
          <span className='user-guides-module'>
            <span>{fmt('perun.admin_console.user_guides_module')}</span>
            <strong>{modules.find(module => module.id === editingModule)?.title ?? editingModule}</strong>
          </span>
        </div>
        <MarkdownEditor
          value={editing.value}
          locale={editing.locale}
          slug={editing.slug}
          locales={locales}
          routes={routes}
          uploadImage={uploadImage}
          resolveImage={resolveImage}
          onSave={handleSave}
          onCancel={() => setState({ editing: null })}
          onMetaChange={(meta) => setState({ editing: { ...editing, route: meta.route }, imageUrls: {} })}
          onExport={exportEditing}
          saving={saving}
        />
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      {header}
      <div className='user-guides-actions'>
        <button type='button' className='md-btn md-btn--primary' onClick={newDoc} disabled={!modules.length}>
          <Icon name='IconPlus' size={16} stroke={1.7} />
          <span>{fmt('perun.admin_console.user_guides_new')}</span>
        </button>
      </div>

      {(loading || saving) && <Loading />}

      {!loading && !saving && !docs.length && (
        <p className='user-guides-empty'>{fmt('perun.admin_console.user_guides_empty')}</p>
      )}

      {!loading && !saving && docs.length > 0 && (
        <table className='user-guides-table'>
          <thead>
            <tr>
              <th>{fmt('perun.admin_console.user_guides_module')}</th>
              <th>{fmt('perun.help_editor.title')}</th>
              <th>{fmt('perun.help_editor.route')}</th>
              <th>{fmt('perun.help_editor.locale')}</th>
              <th>{fmt('perun.help_editor.order')}</th>
              <th>{fmt('perun.admin_console.user_guides_file')}</th>
              <th aria-label={fmt('perun.admin_console.user_guides_delete')} />
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={`${doc.module}/${doc.objectId}`} onClick={() => openDoc(doc)}>
                <td>{modules.find(module => module.id === doc.module)?.title ?? doc.module}</td>
                <td>{doc.notes?.title || doc.slug}</td>
                <td><code>{doc.notes?.route || '--'}</code></td>
                <td>{doc.locale}</td>
                <td>{doc.notes?.order ?? ''}</td>
                <td><code>{docStem(doc.fileName)}.md</code></td>
                <td className='user-guides-row-actions'>
                  <button
                    type='button'
                    className='user-guides-action'
                    title={fmt('perun.help_panel.print')}
                    aria-label={fmt('perun.help_panel.print')}
                    onClick={event => exportDoc(event, doc, 'print')}
                  >
                    <Icon name='IconPrinter' size={17} stroke={1.6} />
                  </button>
                  <button
                    type='button'
                    className='user-guides-action'
                    title={fmt('perun.help_panel.download')}
                    aria-label={fmt('perun.help_panel.download')}
                    onClick={event => exportDoc(event, doc, 'download')}
                  >
                    <Icon name='IconDownload' size={17} stroke={1.6} />
                  </button>
                  <button
                    type='button'
                    className='user-guides-delete'
                    title={fmt('perun.admin_console.user_guides_delete')}
                    disabled={saving}
                    onClick={event => confirmDelete(event, doc)}
                  >
                    <Icon name='IconTrash' size={17} stroke={1.6} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </React.Fragment>
  )
}

UserGuidesAdmin.contextTypes = {
  intl: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
  svSession: state.security.svSession,
})

export default connect(mapStateToProps)(UserGuidesAdmin)
