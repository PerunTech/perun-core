// Monaco is tuned for prose here rather than code: soft wrap on, no minimap, no line highlight or
// overview ruler, so the buffer reads like a document instead of a source file.
export const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  wrappingIndent: 'same',
  renderLineHighlight: 'none',
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  lineNumbers: 'off',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  fontSize: 13,
  lineHeight: 21,
  padding: { top: 14, bottom: 14 },
  automaticLayout: true,
  fixedOverflowWidgets: true,
  quickSuggestions: false,
  occurrencesHighlight: 'off',
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10, alwaysConsumeMouseWheel: false },
};

export const EDIT_SOURCE = 'perun-markdown-editor';

/** Replaces the current selection, leaving the edit on the undo stack as one step. */
export const insertAtCursor = (editor, text) => {
  if (!editor) return;
  editor.executeEdits(EDIT_SOURCE, [{ range: editor.getSelection(), text, forceMoveMarkers: true }]);
  editor.focus();
};

/**
 * Wraps the selection in `before`/`after`, substituting `placeholder` when nothing is selected so
 * the author gets something to type over rather than an empty pair of markers.
 */
export const wrapSelection = (editor, before, after = before, placeholder = '') => {
  if (!editor) return;
  const model = editor.getModel();
  const selection = editor.getSelection();
  if (!model || !selection) return;

  const selected = model.getValueInRange(selection);
  const inner = selected || placeholder;
  insertAtCursor(editor, `${before}${inner}${after}`);
};

/**
 * Adds a line prefix (heading, quote, list marker) to every line the selection touches.
 *
 * With nothing selected and the caret sitting in a line that already has text, the marker opens a
 * new line below instead: the author is starting a list, not converting the sentence they just
 * wrote into one. All four markers interrupt a paragraph on their own in GFM, so one newline is
 * enough and no blank separator line is inserted.
 */
export const prefixLines = (editor, monaco, prefix) => {
  if (!editor || !monaco) return;
  const model = editor.getModel();
  const selection = editor.getSelection();
  if (!model || !selection) return;

  if (selection.isEmpty()) {
    const line = selection.startLineNumber;
    if (model.getLineContent(line).trim()) {
      const column = model.getLineMaxColumn(line);
      editor.executeEdits(EDIT_SOURCE, [{
        range: new monaco.Range(line, column, line, column),
        text: `\n${prefix}`,
        forceMoveMarkers: true,
      }]);
      editor.setPosition({ lineNumber: line + 1, column: prefix.length + 1 });
      editor.focus();
      return;
    }
  }

  const edits = [];
  for (let line = selection.startLineNumber; line <= selection.endLineNumber; line += 1) {
    edits.push({ range: new monaco.Range(line, 1, line, 1), text: prefix, forceMoveMarkers: true });
  }
  editor.executeEdits(EDIT_SOURCE, edits);
  editor.focus();
};

/** A filename slug: lowercase, ASCII-safe, no spaces. Feeds `<locale>_<slug>.md`. */
export const toSlug = (text) => (text ?? '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

export const formatStats = (raw) => {
  const text = raw ?? '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const bytes = new TextEncoder().encode(text).length;
  const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  return `${words} words · ${size}`;
};

/** Files a drop or paste event carries that we are willing to upload as figures. */
export const imageFilesFrom = (dataTransfer) => {
  const files = [...(dataTransfer?.files ?? [])];
  const items = [...(dataTransfer?.items ?? [])]
    .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter(Boolean);

  const all = files.length ? files : items;
  return all.filter(file => file.type.startsWith('image/'));
};

/**
 * A figure name not already used by this document, so two files both called screenshot.png can be
 * inserted without one shadowing the other.
 *
 * @param {string} fileName    the dropped file's own name
 * @param {object} taken       names already pending in this session
 * @param {(name: string) => boolean} isStored  whether the name already exists server side
 */
export const uniqueImageName = (fileName, taken = {}, isStored) => {
  const safe = String(fileName || 'image').replace(/[\\/]/g, '_').trim();
  const dot = safe.lastIndexOf('.');
  const stem = dot > 0 ? safe.slice(0, dot) : safe;
  const extension = dot > 0 ? safe.slice(dot) : '';

  let candidate = safe;
  let suffix = 2;
  while (taken[candidate] || isStored?.(candidate)) {
    candidate = `${stem}-${suffix}${extension}`;
    suffix += 1;
  }
  return candidate;
};

/**
 * Maps a scroll offset from one pane to the other by interpolating between anchor pairs.
 *
 * `pairs` is sorted, ascending in both fields, and always carries a pair for the top of the
 * document and one for the bottom, so a position before the first block or after the last still
 * has something to interpolate against.
 *
 * @param {{editorTop: number, previewTop: number}[]} pairs
 * @param {number} value  offset in the `from` pane
 * @param {'editorTop'|'previewTop'} from
 * @param {'editorTop'|'previewTop'} to
 */
export const projectScroll = (pairs, value, from, to) => {
  if (!pairs || pairs.length < 2) return 0;

  let index = 0;
  while (index + 2 < pairs.length && pairs[index + 1][from] <= value) index += 1;

  const lower = pairs[index];
  const upper = pairs[index + 1];
  const span = upper[from] - lower[from];
  const ratio = span > 0 ? (value - lower[from]) / span : 0;
  return lower[to] + ratio * (upper[to] - lower[to]);
};
