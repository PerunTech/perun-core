import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { Icon } from '../../elements';
import MarkdownPreview from './MarkdownPreview';
import { parseFrontMatter, serializeFrontMatter } from './frontMatter';
import { collectImageNames, LINE_ATTR } from './renderMarkdown';
import getMetadataSchema, { transformMetadataErrors } from './metadataSchema';
import {
  EDITOR_OPTIONS, insertAtCursor, wrapSelection, prefixLines,
  toSlug, formatStats, imageFilesFrom, uniqueImageName, projectScroll,
} from './utils';

// Rendering the preview costs a full marked parse plus a DOMPurify pass over the whole document,
// which is far too much to repeat on every keystroke of a long manual. The buffer stays instant;
// the preview and the stats readout trail it. Matches the 200ms the JSON editor debounces at.
// RJSF's Form.submit() dispatches a synthetic submit event AND calls requestSubmit(), so the
// handler runs twice and one click writes two files (@rjsf/core 5.23.2, Form.js:230-238). The
// toolbar button submits the form natively by id instead, which fires exactly once.
const META_FORM_ID = 'help-md-meta-form';

const PREVIEW_DEBOUNCE_MS = 200;

const useDebounced = (value, delay) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
};

const toForm = (meta, locale, slug) => ({
  route: meta.route ?? '',
  title: meta.title ?? '',
  order: meta.order === undefined || meta.order === '' ? undefined : Number(meta.order),
  locale,
  slug,
});

// Front matter is kept out of the Monaco buffer on purpose. The author edits prose; route, title,
// order, locale and slug live in the form above it. Nothing the form does rewrites the buffer, so a
// metadata edit can never move the cursor or break the undo stack. The two halves are recombined on
// save, which is what puts the front matter into the stored file where it travels with the document.
const MarkdownEditor = ({
  value,
  locale: initialLocale = '',
  slug: initialSlug = '',
  locales = [],
  routes = [],
  uploadImage,
  resolveImage,
  onSave,
  onCancel,
  onMetaChange,
  onExport,
  saving = false,
}, context) => {
  const { intl } = context;
  const fmt = useCallback((id) => intl.formatMessage({ id, defaultMessage: id }), [intl]);

  const parsed = useMemo(() => parseFrontMatter(value), [value]);

  const [form, setForm] = useState(
    () => toForm(parsed.meta, initialLocale || locales[0]?.value || '', initialSlug)
  );
  const [body, setBody] = useState(parsed.body);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialSlug));
  const [showPreview, setShowPreview] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  // Figures the author has inserted but not yet committed: { name: { file, url } }. Held locally
  // so an insert that gets undone never reaches the file store as an orphan.
  const [pending, setPending] = useState({});

  // Trails `body`, so parsing happens after a typing pause rather than inside the keystroke.
  const previewBody = useDebounced(body, PREVIEW_DEBOUNCE_MS);
  const stats = useMemo(() => formatStats(previewBody), [previewBody]);

  // The badge counts the same set the save path uploads: figures the document still points at.
  // An image inserted and then deleted stays in `pending` so an undo can still resolve its
  // preview, but it is not pending anything any more and must not be advertised as such.
  const pendingNames = useMemo(() => {
    const referenced = new Set(collectImageNames(previewBody));
    return Object.keys(pending).filter((name) => referenced.has(name));
  }, [pending, previewBody]);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const scrollSubRef = useRef(null);
  // Whichever pane the user is actually scrolling holds the lock, so the scroll we induce on the
  // other one does not bounce straight back and fight it.
  const lockRef = useRef(null);
  // Mirrors `pending` for synchronous reads while naming a batch of dropped files.
  const pendingRef = useRef({});
  // Tracks the document we last loaded, so a new `value` from the parent re-seeds the form but our
  // own edits echoing back through it do not.
  const loadedRef = useRef(value);

  useEffect(() => () => scrollSubRef.current?.dispose(), []);

  // Hiding the preview changes the grid template, which resizes the pane without a window resize.
  // automaticLayout can miss that, leaving the text column at its old half-width inside a pane that
  // is now full width. Measuring explicitly on the toggle keeps the content matched to the pane.
  useEffect(() => { editorRef.current?.layout(); }, [showPreview]);

  useEffect(() => { pendingRef.current = pending; }, [pending]);

  useEffect(() => () => {
    Object.values(pendingRef.current).forEach(entry => URL.revokeObjectURL(entry.url));
  }, []);

  useEffect(() => {
    if (value === loadedRef.current) return;
    loadedRef.current = value;
    const next = parseFrontMatter(value);
    setForm(current => toForm(next.meta, current.locale, current.slug));
    setBody(next.body);
  }, [value]);

  // A translation normally reuses the source document's slug, and toSlug drops non-Latin scripts
  // entirely, so the suggestion only ever fills an untouched field.
  useEffect(() => {
    if (slugTouched) return;
    const suggestion = toSlug(form.title);
    if (suggestion) setForm(current => ({ ...current, slug: suggestion }));
  }, [form.title, slugTouched]);

  const { schema, uiSchema } = useMemo(
    () => getMetadataSchema(context, { locales, routes }),
    // context is the legacy intl container and is stable for a given locale
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl, locales, routes]
  );

  const transformErrors = useCallback(
    (errors) => transformMetadataErrors(errors, context),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl]
  );

  const handleFormChange = ({ formData }) => {
    if (formData.slug !== form.slug) setSlugTouched(true);
    setForm(formData);
    // The route decides which plugin row the document and its figures are stored under, and the
    // owner of that decision is outside this component.
    if (formData.route !== form.route) onMetaChange?.(formData);
  };

  const resolvePreviewImage = useCallback(
    (name) => pending[name]?.url ?? resolveImage?.(name) ?? null,
    [pending, resolveImage]
  );

  // Exports the buffer as it stands, resolver included: the parent stores figures but only this
  // component knows about the ones dropped in this session and not yet uploaded, so an exported
  // draft carries exactly what the preview shows.
  const exportNow = useCallback(
    // Named around the component's own `form`, which holds the metadata and is what the two lines
    // below read.
    (exportForm) => onExport?.(
      exportForm,
      serializeFrontMatter({ route: form.route, title: form.title, order: form.order }, body),
      resolvePreviewImage
    ),
    [onExport, form.route, form.title, form.order, body, resolvePreviewImage]
  );

  // Whichever pane the user is driving holds the lock, so the scroll we induce on the other one
  // does not bounce back and fight it.
  const withScrollLock = useCallback((side, apply) => {
    if (lockRef.current && lockRef.current !== side) return;
    lockRef.current = side;
    apply();
    window.requestAnimationFrame(() => { lockRef.current = null; });
  }, []);

  /**
   * Pairs each rendered block's top with the top of the source line it came from.
   *
   * Sync used to be proportional, holding both panes at the same fraction of their scroll range.
   * That assumes source and rendered content have the same density, which an image breaks harder
   * than anything else: one line of Markdown becomes several hundred pixels of preview. Anchors
   * make the mapping piecewise linear between real landmarks instead, so a figure moves the two
   * panes together rather than pushing them apart.
   */
  const anchorPairs = useCallback(() => {
    const preview = previewRef.current;
    const editor = editorRef.current;
    if (!preview || !editor) return [];

    // getBoundingClientRect is viewport relative; this rebases it onto the scrolled content.
    const base = preview.getBoundingClientRect().top - preview.scrollTop;
    const pairs = [{ editorTop: 0, previewTop: 0 }];

    preview.querySelectorAll(`[${LINE_ATTR}]`).forEach((element) => {
      const line = Number(element.getAttribute(LINE_ATTR));
      if (!line) return;
      pairs.push({
        editorTop: editor.getTopForLineNumber(line),
        previewTop: element.getBoundingClientRect().top - base,
      });
    });

    pairs.push({ editorTop: editor.getScrollHeight(), previewTop: preview.scrollHeight });
    return pairs;
  }, []);

  const alignPreviewToEditor = useCallback(() => {
    const preview = previewRef.current;
    const editor = editorRef.current;
    if (!preview || !editor) return;

    withScrollLock('editor', () => {
      const target = projectScroll(anchorPairs(), editor.getScrollTop(), 'editorTop', 'previewTop');
      const limit = Math.max(preview.scrollHeight - preview.clientHeight, 0);
      preview.scrollTop = Math.min(Math.max(target, 0), limit);
    });
  }, [withScrollLock, anchorPairs]);

  // Each debounced render replaces the preview's content wholesale, which collapses its height to
  // zero for an instant and lets the browser clamp the scroll position to the top. Without this the
  // preview snaps back to the start every 200ms while the author is typing further down.
  useEffect(alignPreviewToEditor, [previewBody, alignPreviewToEditor]);

  // A figure contributes no height until it decodes, so anchors measured at render time put every
  // block after it too high. Re-aligning as each one lands is what keeps an illustrated document in
  // step instead of drifting further the more images it carries.
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return undefined;

    const loading = [...preview.querySelectorAll('img')].filter((img) => !img.complete);
    if (!loading.length) return undefined;

    const settle = () => alignPreviewToEditor();
    loading.forEach((img) => {
      img.addEventListener('load', settle);
      img.addEventListener('error', settle);
    });
    return () => loading.forEach((img) => {
      img.removeEventListener('load', settle);
      img.removeEventListener('error', settle);
    });
  }, [previewBody, alignPreviewToEditor]);

  const handlePreviewScroll = () => {
    const preview = previewRef.current;
    const editor = editorRef.current;
    if (!preview || !editor) return;

    withScrollLock('preview', () => {
      const target = projectScroll(anchorPairs(), preview.scrollTop, 'previewTop', 'editorTop');
      editor.setScrollTop(Math.max(target, 0));
    });
  };

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    scrollSubRef.current?.dispose();
    scrollSubRef.current = editor.onDidScrollChange(alignPreviewToEditor);
  }, [alignPreviewToEditor]);

  // Inserting a figure only previews it. The bytes are uploaded on save, and only if the
  // reference is still in the document by then.
  const addImages = useCallback((files) => {
    if (!files.length) return;
    setUploadError('');

    const taken = { ...pendingRef.current };
    const additions = {};

    files.forEach(file => {
      const name = uniqueImageName(file.name, taken, candidate => Boolean(resolveImage?.(candidate)));
      const entry = { file, url: URL.createObjectURL(file) };
      taken[name] = entry;
      additions[name] = entry;
      insertAtCursor(editorRef.current, `\n![${file.name.replace(/\.[^.]+$/, '')}](${name})\n`);
    });

    pendingRef.current = taken;
    setPending(taken);
  }, [resolveImage]);

  const handlePaste = useCallback((event) => {
    const files = imageFilesFrom(event.clipboardData);

    if (!files.length) {
      // A pasted document leaves Monaco scrolled to the end of the insertion, where the caret
      // lands, while the preview renders from the beginning. Send both panes and the caret to the
      // top so the author reads the new content from its start, and so the first keystroke does
      // not snap the view back to the end of what was just pasted.
      window.requestAnimationFrame(() => {
        withScrollLock('editor', () => {
          const editor = editorRef.current;
          // setPosition moves the caret without revealing it, so the explicit scroll below is what
          // actually decides where the view lands.
          editor?.setPosition({ lineNumber: 1, column: 1 });
          editor?.setScrollTop(0);
          if (previewRef.current) previewRef.current.scrollTop = 0;
        });
      });
      return;
    }

    // Without this Monaco pastes the filename as text alongside the upload.
    event.preventDefault();
    addImages(files);
  }, [addImages, withScrollLock]);

  const handleDrop = useCallback((event) => {
    const files = imageFilesFrom(event.dataTransfer);
    setDragging(false);
    if (!files.length) return;
    event.preventDefault();
    event.stopPropagation();
    addImages(files);
  }, [addImages]);

  const handleFilePick = (event) => {
    addImages([...(event.target.files ?? [])]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // RJSF validates on submit and only calls this when the metadata is valid, so the toolbar's Save
  // drives the form rather than carrying its own copy of the rules.
  const handleSubmit = async ({ formData }) => {
    const meta = { route: formData.route, title: formData.title, order: formData.order };
    const document = serializeFrontMatter(meta, body);

    // Only figures the document still points at are worth storing; the rest were inserted and
    // then removed, and are dropped with the object URLs that backed their preview.
    const referenced = new Set(collectImageNames(body));
    const entries = Object.entries(pending);

    if (entries.length && uploadImage) {
      setUploading(true);
      setUploadError('');
      try {
        for (const [name, entry] of entries) {
          if (!referenced.has(name)) continue;
          await uploadImage(entry.file, { locale: formData.locale, slug: formData.slug, name });
        }
      } catch (error) {
        setUploadError(error?.message || fmt('perun.help_editor.error_upload'));
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    entries.forEach(([, entry]) => URL.revokeObjectURL(entry.url));
    pendingRef.current = {};
    setPending({});

    loadedRef.current = document;
    onSave?.({ document, locale: formData.locale, slug: formData.slug, meta });
  };

  const tool = (icon, labelId, action, disabled = false) => (
    <button
      type='button'
      className='md-tool'
      title={fmt(labelId)}
      aria-label={fmt(labelId)}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action}
    >
      <Icon name={icon} size={17} stroke={1.6} />
    </button>
  );

  return (
    <div className='md-editor'>

      <div className='md-meta'>
        <Form
          id={META_FORM_ID}
          schema={schema}
          uiSchema={uiSchema}
          formData={form}
          validator={validator}
          transformErrors={transformErrors}
          showErrorList={false}
          noHtml5Validate
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          className='md-meta-form'
        >
          {/* Suppresses RJSF's own submit button; the toolbar's Save submits through the ref. */}
          <></>
        </Form>
        <div className='md-saves-as'>
          <span>{fmt('perun.help_editor.saves_as')}</span>
          <code>{form.locale && form.slug ? `${form.locale}_${form.slug}.md` : '--'}</code>
        </div>
      </div>

      <div className='md-toolbar'>
        <div className='md-tool-group'>
          {tool('IconHeading', 'perun.help_editor.heading', () => prefixLines(editorRef.current, monacoRef.current, '## '))}
          {tool('IconBold', 'perun.help_editor.bold', () => wrapSelection(editorRef.current, '**', '**', fmt('perun.help_editor.bold')))}
          {tool('IconItalic', 'perun.help_editor.italic', () => wrapSelection(editorRef.current, '_', '_', fmt('perun.help_editor.italic')))}
          {tool('IconCode', 'perun.help_editor.code', () => wrapSelection(editorRef.current, '`', '`', 'code'))}
          {tool('IconLink', 'perun.help_editor.link', () => wrapSelection(editorRef.current, '[', '](https://)', fmt('perun.help_editor.link')))}
        </div>

        <div className='md-tool-group'>
          {tool('IconList', 'perun.help_editor.bullet_list', () => prefixLines(editorRef.current, monacoRef.current, '- '))}
          {tool('IconListNumbers', 'perun.help_editor.numbered_list', () => prefixLines(editorRef.current, monacoRef.current, '1. '))}
          {tool('IconQuote', 'perun.help_editor.quote', () => prefixLines(editorRef.current, monacoRef.current, '> '))}
        </div>

        <div className='md-tool-group'>
          <button
            type='button'
            className='md-tool md-tool--wide'
            onClick={() => fileInputRef.current?.click()}
            disabled={!uploadImage}
          >
            <Icon name='IconPhotoPlus' size={17} stroke={1.6} />
            <span>{fmt('perun.help_editor.insert_image')}</span>
          </button>
          {pendingNames.length > 0 && (
            <span className='md-pending' title={fmt('perun.help_editor.pending_hint')}>
              {pendingNames.length} {fmt('perun.help_editor.pending')}
            </span>
          )}
        </div>

        <div className='md-tool-group md-tool-group--end'>
          {onExport && tool('IconFileTypePdf', 'perun.help_panel.download_pdf', () => exportNow('pdf'))}
          {onExport && tool('IconFileZip', 'perun.help_panel.download_source', () => exportNow('source'))}
          {tool(showPreview ? 'IconEyeOff' : 'IconEye', 'perun.help_editor.toggle_preview', () => setShowPreview(v => !v))}
          <span className='md-stats'>{stats}</span>
          {onCancel && (
            <button type='button' className='md-btn md-btn--ghost' onClick={onCancel}>
              {fmt('perun.help_editor.cancel')}
            </button>
          )}
          <button
            type='submit'
            form={META_FORM_ID}
            className='md-btn md-btn--primary'
            disabled={saving || uploading}
          >
            <Icon name={saving || uploading ? 'IconLoader2' : 'IconDeviceFloppy'} size={17} stroke={1.6} />
            <span>{fmt(uploading ? 'perun.help_editor.uploading' : saving ? 'perun.help_editor.saving' : 'perun.help_editor.save')}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className='md-problems'>
          <Icon name='IconAlertTriangle' size={16} stroke={1.7} />
          <span>{uploadError}</span>
        </div>
      )}

      <div
        className={`md-panes${showPreview ? '' : ' md-panes--solo'}${dragging ? ' md-panes--dropping' : ''}`}
        onPasteCapture={handlePaste}
        onDropCapture={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
      >
        {/* Monaco resolves the right-click target before it focuses itself, so on an unfocused
            editor the first contextmenu can fall outside the CONTENT_TEXT/CONTENT_EMPTY/TEXTAREA
            targets it accepts and be dropped. Focusing on the right-button mousedown, which fires
            first, means the editor is already focused by the time it handles the menu. Scoped to
            button 2 so ordinary clicking and drag-selection are untouched. */}
        <div
          className='md-pane md-pane--source'
          onMouseDownCapture={(event) => { if (event.button === 2) editorRef.current?.focus(); }}
        >
          <Editor
            height='100%'
            language='markdown'
            theme='vs'
            value={body}
            onChange={(next) => setBody(next ?? '')}
            onMount={handleMount}
            options={EDITOR_OPTIONS}
            loading={<div className='md-loading'>{fmt('perun.main.loading')}</div>}
          />
          {dragging && <div className='md-dropzone'>{fmt('perun.help_editor.drop_images')}</div>}
        </div>

        {showPreview && (
          <div className='md-pane md-pane--preview' ref={previewRef} onScroll={handlePreviewScroll}>
            <MarkdownPreview markdown={previewBody} resolveImage={resolvePreviewImage} />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple
        className='md-file-input'
        onChange={handleFilePick}
      />
    </div>
  );
};

MarkdownEditor.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default MarkdownEditor;
