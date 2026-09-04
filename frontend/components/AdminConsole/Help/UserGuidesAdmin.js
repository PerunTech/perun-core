import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Form from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'
import { Icon, alertUserV2, alertUserResponse } from '../../../elements'
import { getServerOrigin } from '../../../functions/utils'
import { MarkdownEditor } from '../../MarkdownEditor'
import AdminConsoleHelpButton from './AdminConsoleHelpButton'
import Loading from '../../Loading/Loading'
import {
  HELP_IMAGE, PDF_KIND,
  listHelpModules, fetchHelpText, saveHelpDoc, savePdfManual, uploadHelpFile,
  buildImageName, displayImageName, createBlobCache, docStem, deleteHelpDoc, kindExtension,
} from '../../../elements/help/helpFiles'
import {
  clearHelpIndexCache, figureResolver, loadGuideFigures, loadGuideIndex, loadImageIndex,
  ownerModuleForRoute
} from '../../../elements/help/routeGuides'
import { downloadGuideArchive, downloadGuidePdf } from '../../../elements/help/helpExport'
import { parseFrontMatter } from '../../MarkdownEditor/frontMatter'
import getMetadataSchema, { transformMetadataErrors } from '../../MarkdownEditor/metadataSchema'
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

const UPLOAD_UI_SCHEMA = {
  'ui:order': ['route', 'title', 'locale', 'slug', 'order'],
  route: { 'ui:classNames': 'user-guides-field user-guides-field--wide' },
  title: { 'ui:classNames': 'user-guides-field user-guides-field--wide' },
  locale: { 'ui:classNames': 'user-guides-field' },
  slug: { 'ui:classNames': 'user-guides-field' },
  order: { 'ui:classNames': 'user-guides-field' },
}

/** A file size a person reads rather than a byte count, for the chosen manual. */
const fileSize = (bytes) => {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const UserGuidesAdmin = (props, context) => {
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id })

  const initialState = {
    loading: true, saving: false, exporting: false,
    modules: [], docs: [], locales: [], editing: null, imageUrls: {},
    uploading: false, uploadFile: null,
  }
  const reducer = (currState, update) => ({ ...currState, ...update })
  const [{
    loading, saving, exporting, modules, docs, locales, editing, imageUrls, uploading, uploadFile,
  }, setState] = useReducer(reducer, initialState)

  const cache = useRef(createBlobCache())
  const manualInputRef = useRef(null)
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
        // The reader's cached index rather than a listing of its own: it is the same one call per
        // plugin row, and every write here clears that cache, so the two cannot drift apart.
        const records = await loadGuideIndex(svSession, module.objectId)
        return records.map(record => ({ ...record, module: module.id }))
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
        const records = await loadImageIndex(svSession, objectId)
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
   * Exports one stored guide, as a PDF to read or as its source to edit.
   *
   * The figures are read the way the reader reads them, so the PDF carries its screenshots rather
   * than a column of gaps and the archive carries the files the Markdown names.
   */
  const exportDoc = async (event, record, form) => {
    event.stopPropagation()
    setState({ exporting: true })

    try {
      const raw = await fetchHelpText(svSession, record)
      const { body } = parseFrontMatter(raw)
      const anchor = { anchorId: anchorFor(record.module), locale: record.locale, slug: record.slug }
      const images = await loadGuideFigures(svSession, anchor, collectImageNames(body), cache.current)
      const resolveUrl = figureResolver(images)

      if (form === 'pdf') {
        await downloadGuidePdf(record.fileName, { title: record.notes?.title || record.slug, body, resolveUrl })
      } else {
        await downloadGuideArchive(record.fileName, raw, resolveUrl)
      }
    } catch (err) {
      console.error(err)
      alertUserResponse({ response: err })
    } finally {
      setState({ exporting: false })
    }
  }

  /**
   * Exports what is on screen rather than what is stored, so an author can take a draft away before
   * committing it. The editor hands over the recombined document and its own resolver, which covers
   * figures dropped in this session and not yet uploaded, so a draft exports as it previews.
   */
  const exportEditing = async (form, document, resolveFigure) => {
    const fileName = `${editing.locale}_${editing.slug || 'untitled'}.md`
    setState({ exporting: true })

    try {
      const resolveUrl = resolveFigure ?? resolveImage
      if (form === 'pdf') {
        const { meta, body } = parseFrontMatter(document)
        await downloadGuidePdf(fileName, { title: meta.title || editing.slug, body, resolveUrl })
      } else {
        await downloadGuideArchive(fileName, document, resolveUrl)
      }
    } catch (err) {
      console.error(err)
      alertUserResponse({ response: err })
    } finally {
      setState({ exporting: false })
    }
  }

  /**
   * Stores an uploaded PDF against the module its route belongs to.
   *
   * The anchor is derived from the submitted route exactly as a written guide's is, which is what
   * keeps an uploaded manual readable at the route it claims: the reader only ever consults the
   * route's own module and perun-core.
   */
  const uploadManual = async ({ file, meta }) => {
    const module = ownerModuleForRoute(meta.route, modules)
    const objectId = anchorFor(module)
    if (!objectId) {
      alertUserV2({ type: 'info', title: fmt('perun.admin_console.user_guides_no_anchor') })
      return
    }

    try {
      setState({ saving: true })
      await savePdfManual(svSession, {
        objectId,
        locale: meta.locale,
        slug: meta.slug,
        file,
        // The same notes a written guide carries, module included: pickLocale groups a document's
        // translations by module and slug, so a manual without one would share a key with every
        // other module's manual of that slug and all but one would be dropped from the list.
        notes: { route: meta.route, title: meta.title, order: meta.order, locale: meta.locale, module },
      })
      clearHelpIndexCache()
      await loadDocs(modules)
      setState({ saving: false, uploading: false, uploadFile: null })
      alertUserV2({ type: 'success', title: fmt('perun.admin_console.saved') })
    } catch (err) {
      console.error(err)
      setState({ saving: false })
      alertUserResponse({ response: err })
    }
  }

  /**
   * Opens the metadata form on the file that was picked.
   *
   * The input is cleared afterwards so choosing the same file twice fires a change event again;
   * without it, cancelling an upload and re-picking the same manual would do nothing.
   */
  const pickManual = (event) => {
    const file = event.target.files?.[0] ?? null
    if (manualInputRef.current) manualInputRef.current.value = ''
    if (file) setState({ uploadFile: file, uploading: true })
  }

  const cancelUpload = () => setState({ uploading: false, uploadFile: null })

  const uploadSchema = useMemo(
    () => getMetadataSchema(context, { locales, routes }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locales, routes]
  )

  /**
   * A slug seeded from the chosen file, since a manual usually arrives already named.
   *
   * The schema's slug pattern is strict, so the file name is folded to fit it rather than offered
   * as-is and rejected on submit.
   */
  const uploadDefaults = useMemo(() => ({
    route: routes[0]?.value ?? '',
    locale: locales[0]?.value ?? '',
    order: 1,
    slug: (uploadFile?.name ?? '')
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    title: (uploadFile?.name ?? '').replace(/\.pdf$/i, ''),
  }), [routes, locales, uploadFile])

  const openDoc = async (record) => {
    if (record.kind === PDF_KIND) return
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
      await deleteHelpDoc(svSession, { objectId, fileName: doc.fileName, kind: doc.kind })
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
        {exporting && <Loading />}
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
        <button
          type='button'
          className='md-btn user-guides-upload-btn'
          onClick={() => manualInputRef.current?.click()}
          disabled={!modules.length}
        >
          <Icon name='IconUpload' size={16} stroke={1.7} />
          <span>{fmt('perun.admin_console.user_guides_upload')}</span>
        </button>
      </div>

      <input
        ref={manualInputRef}
        type='file'
        accept='application/pdf,.pdf'
        className='md-file-input'
        onChange={pickManual}
      />

      {uploading && uploadFile && (
        <section className='user-guides-upload' aria-label={fmt('perun.admin_console.user_guides_upload')}>
          <header className='user-guides-upload-head'>
            <h3>{fmt('perun.admin_console.user_guides_upload')}</h3>
            <button
              type='button'
              className='user-guides-upload-close'
              title={fmt('perun.help_editor.cancel')}
              aria-label={fmt('perun.help_editor.cancel')}
              onClick={cancelUpload}
            >
              <Icon name='IconX' size={16} stroke={1.7} />
            </button>
          </header>

          <p className='user-guides-upload-file'>
            <Icon name='IconFileTypePdf' size={22} stroke={1.5} />
            <span className='user-guides-upload-name'>{uploadFile.name}</span>
            <span className='user-guides-upload-size'>{fileSize(uploadFile.size)}</span>
            <button type='button' className='user-guides-upload-swap' onClick={() => manualInputRef.current?.click()}>
              {fmt('perun.admin_console.user_guides_choose_other')}
            </button>
          </p>

          <p className='user-guides-upload-hint'>{fmt('perun.admin_console.user_guides_upload_hint')}</p>

          <Form
            schema={uploadSchema.schema}
            uiSchema={UPLOAD_UI_SCHEMA}
            formData={uploadDefaults}
            validator={validator}
            transformErrors={errors => transformMetadataErrors(errors, context)}
            showErrorList={false}
            noHtml5Validate
            className='user-guides-upload-form'
            onSubmit={({ formData }) => uploadManual({ file: uploadFile, meta: formData })}
          >
            <div className='user-guides-upload-actions'>
              <button type='button' className='md-btn md-btn--ghost' onClick={cancelUpload}>
                {fmt('perun.help_editor.cancel')}
              </button>
              <button type='submit' className='md-btn md-btn--primary' disabled={saving}>
                <Icon name='IconUpload' size={16} stroke={1.7} />
                <span>{fmt('perun.admin_console.user_guides_upload')}</span>
              </button>
            </div>
          </Form>
        </section>
      )}

      {(loading || saving || exporting) && <Loading />}

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
                <td>
                  <code>{`${docStem(doc.fileName)}.${kindExtension(doc.kind)}`}</code>
                </td>
                <td className='user-guides-row-actions'>
                  <button
                    type='button'
                    className='user-guides-action'
                    hidden={doc.kind === PDF_KIND}
                    disabled={exporting}
                    title={fmt('perun.help_panel.download_pdf')}
                    aria-label={fmt('perun.help_panel.download_pdf')}
                    onClick={event => exportDoc(event, doc, 'pdf')}
                  >
                    <Icon name='IconFileTypePdf' size={17} stroke={1.6} />
                  </button>
                  <button
                    type='button'
                    className='user-guides-action'
                    hidden={doc.kind === PDF_KIND}
                    disabled={exporting}
                    title={fmt('perun.help_panel.download_source')}
                    aria-label={fmt('perun.help_panel.download_source')}
                    onClick={event => exportDoc(event, doc, 'source')}
                  >
                    <Icon name='IconFileZip' size={17} stroke={1.6} />
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
