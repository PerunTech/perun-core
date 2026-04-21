import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Editor, DiffEditor } from '@monaco-editor/react';
import { Icon, alertUserV2 } from '../../elements';

const THEMES = [
  { value: 'vs', label: 'Light Theme' },
  { value: 'vs-dark', label: 'Dark Theme' },
  { value: 'hc-black', label: 'High Contrast Theme' },
];
const FALLBACK_LABELS = {
  'perun.admin_console.config_menu_confirm': 'Apply Changes',
  'perun.admin_console.json_invalid': 'Invalid JSON',
  'perun.admin_console.show_diff': 'Show Diff',
  'perun.admin_console.back_to_editor': 'Back to Editor',
  'perun.admin_console.format': 'Format',
  'perun.admin_console.copy': 'Copy',
  'perun.admin_console.reset': 'Reset',
};

const BASE_OPTIONS = { minimap: { enabled: false }, scrollBeyondLastLine: false, formatOnPaste: true, fixedOverflowWidgets: true };
const DIFF_OPTIONS = { ...BASE_OPTIONS, readOnly: true };
const EDITOR_HEIGHT = '60vh';
// Bootstrap modal fade animation duration
const MODAL_ANIMATION_MS = 350;

const getStats = (raw) => {
  const lines = raw?.split('\n').length;
  const bytes = new Blob([raw]).size;
  const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
  return `${lines} lines · ${size}`;
};

const JsonEditor = ({ value, onSave }, context) => {
  const [showDiff, setShowDiff] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [stats, setStats] = useState(() => getStats(JSON.stringify(value, null, 2)));

  const originalRaw = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const currentRawRef = useRef(originalRaw);
  const isValidRef = useRef(true);
  const editorRef = useRef(null);

  const theme = THEMES[themeIndex].value;
  const themeLabel = THEMES[themeIndex].label;
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: FALLBACK_LABELS[id] ?? id });

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    // Monaco appends context-view (position:absolute) to getContainerDomNode() and
    // calculates top/left assuming it is the CSS containing block. Without
    // position:relative the context-view falls through to .modal-content, shifting
    // every tooltip by the offset between the two elements.
    editor.getContainerDomNode().style.position = 'relative';
    setTimeout(() => editor.layout(), MODAL_ANIMATION_MS);
  }, []);

  const handleChange = useCallback((raw) => {
    currentRawRef.current = raw ?? '';
    setStats(getStats(currentRawRef.current));
  }, []);

  const handleValidate = useCallback((markers) => {
    isValidRef.current = markers.length === 0;
  }, []);

  const handleFormat = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentRawRef.current);
  }, []);

  const handleReset = useCallback(() => {
    currentRawRef.current = originalRaw;
    isValidRef.current = true;
    setStats(getStats(originalRaw));
    setResetKey(k => k + 1);
  }, [originalRaw]);

  const handleSave = useCallback(() => {
    if (!isValidRef.current) {
      alertUserV2({
        type: 'error',
        title: fmt('perun.admin_console.json_invalid'),
      });
      return;
    }
    try { onSave(JSON.parse(currentRawRef.current)); } catch { }
  }, [onSave]);

  return (
    <div className='json-editor-container'>
      <div className='json-editor-toolbar'>
        <button type='button' onClick={() => setThemeIndex(i => (i + 1) % THEMES.length)} className='json-editor-btn btn-success btn_save_form json-editor-theme-btn'>
          {themeLabel}
          <span className='json-editor-icon'><Icon name='IconPalette' /></span>
        </button>
        <button type='button' onClick={() => setShowDiff(s => !s)} className='json-editor-btn btn-success btn_save_form json-editor-diff-btn'>
          {fmt(showDiff ? 'perun.admin_console.back_to_editor' : 'perun.admin_console.show_diff')}
          <span className='json-editor-icon'><Icon name={showDiff ? 'IconCode' : 'IconGitCompare'} /></span>
        </button>
        <button type='button' onClick={handleFormat} disabled={showDiff} className='json-editor-btn btn-success btn_save_form'>
          {fmt('perun.admin_console.format')}
          <span className='json-editor-icon'><Icon name='IconWand' /></span>
        </button>
        <button type='button' onClick={handleCopy} className='json-editor-btn btn-success btn_save_form'>
          {fmt('perun.admin_console.copy')}
          <span className='json-editor-icon'><Icon name='IconCopy' /></span>
        </button>
        <button type='button' onClick={handleReset} className='json-editor-btn btn-success btn_save_form'>
          {fmt('perun.admin_console.reset')}
          <span className='json-editor-icon'><Icon name='IconRefresh' /></span>
        </button>
        <button type='button' onClick={handleSave} className='json-editor-btn btn-success btn_save_form'>
          {fmt('perun.admin_console.config_menu_confirm')}
          <span className='json-editor-icon'><Icon name='IconCheck' /></span>
        </button>
        <span className='json-editor-stats'>{stats}</span>
      </div>
      <div style={{ display: showDiff ? 'none' : 'block' }}>
        <Editor
          key={resetKey}
          height={EDITOR_HEIGHT}
          language='json'
          theme={theme}
          defaultValue={originalRaw}
          onMount={handleMount}
          onChange={handleChange}
          onValidate={handleValidate}
          options={BASE_OPTIONS}
        />
      </div>
      {showDiff && (
        <DiffEditor
          height={EDITOR_HEIGHT}
          language='json'
          theme={theme}
          original={originalRaw}
          modified={currentRawRef.current}
          options={DIFF_OPTIONS}
        />
      )}
    </div>
  );
};

JsonEditor.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default JsonEditor;
