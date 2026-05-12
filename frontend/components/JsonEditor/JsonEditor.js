import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Editor, DiffEditor } from '@monaco-editor/react';
import { Icon, alertUserV2 } from '../../elements';
import { THEMES, BASE_OPTIONS, DIFF_OPTIONS, EDITOR_HEIGHT, getStats } from './utils';

const JsonEditor = ({ value, originalValue, onSave, onDownload }, context) => {
  const [showDiff, setShowDiff] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  // Incrementing this key remounts the Editor, which is the only way to reset its value — Monaco has no reset API
  const [resetKey, setResetKey] = useState(0);
  const [stats, setStats] = useState(() => getStats(JSON.stringify(value, null, 2)));

  const originalRaw = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const diffOriginalRaw = useMemo(
    () => originalValue != null ? JSON.stringify(originalValue, null, 2) : originalRaw,
    [originalValue, originalRaw]
  );
  // Refs instead of state to avoid re-renders on every keystroke
  const currentRawRef = useRef(originalRaw);
  const isValidRef = useRef(true);
  const editorRef = useRef(null);

  const theme = THEMES[themeIndex].value;
  const themeLabel = THEMES[themeIndex].label;
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id });

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
    const text = currentRawRef.current;
    // clipboard API requires a secure context (HTTPS); fall back to execCommand for HTTP
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, []);

  const handleReset = useCallback(() => {
    currentRawRef.current = originalRaw;
    isValidRef.current = true;
    setStats(getStats(originalRaw));
    setResetKey(k => k + 1);
  }, [originalRaw]);

  const handleAction = useCallback((fn) => {
    if (!isValidRef.current) {
      alertUserV2({
        type: 'error',
        title: fmt('perun.admin_console.json_invalid'),
      });
      return;
    }
    try { fn(JSON.parse(currentRawRef.current)); } catch (err) { console.error(err) }
  }, []);

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
        {onSave && (
          <button type='button' onClick={() => handleAction(onSave)} className='json-editor-btn btn-success btn_save_form'>
            {fmt('perun.admin_console.config_menu_confirm')}
            <span className='json-editor-icon'><Icon name='IconCheck' /></span>
          </button>
        )}
        {onDownload && (
          <button type='button' onClick={() => handleAction(onDownload)} className='json-editor-btn btn-success btn_save_form'>
            {fmt('perun.admin_console.export_table_and_fields')}
            <span className='json-editor-icon'><Icon name='IconDatabaseExport' /></span>
          </button>
        )}
        <span className='json-editor-stats'>{stats}</span>
      </div>
      {/* Hidden instead of unmounted to preserve the editor's undo history when toggling diff view */}
      <div style={{ display: showDiff ? 'none' : 'block' }}>
        <Editor
          key={resetKey}
          height={EDITOR_HEIGHT}
          language='json'
          theme={theme}
          defaultValue={originalRaw}
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
          original={diffOriginalRaw}
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
