import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Editor, DiffEditor } from '@monaco-editor/react';
import { Icon, alertUserV2 } from '../../elements';
import { THEMES, BASE_OPTIONS, DIFF_OPTIONS, EDITOR_HEIGHT, getStats } from './utils';

const JsonEditor = ({ value, onSave }, context) => {
  const [showDiff, setShowDiff] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  // Incrementing this key remounts the Editor, which is the only way to reset its value — Monaco has no reset API
  const [resetKey, setResetKey] = useState(0);
  const [stats, setStats] = useState(() => getStats(JSON.stringify(value, null, 2)));

  const originalRaw = useMemo(() => JSON.stringify(value, null, 2), [value]);
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
