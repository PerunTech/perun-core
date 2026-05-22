import React from 'react'
import MonacoEditor from '@monaco-editor/react'

const { useState, useEffect, useRef } = React

const toEditorValue = (v) => {
  if (!v) return ''
  try {
    return JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2)
  } catch {
    return typeof v === 'string' ? v : ''
  }
}

const GuiMetadataWidget = ({ value, onChange, disabled, readonly, fmt }) => {
  const [editorValue, setEditorValue] = useState(() => toEditorValue(value))
  const [isValid, setIsValid] = useState(true)
  const isValidRef = useRef(true)

  useEffect(() => {
    setEditorValue(toEditorValue(value))
  }, [])

  const handleChange = (val) => {
    setEditorValue(val)
    if (!val || val.trim() === '') {
      setIsValid(true)
      onChange(undefined)
      return
    }
    try {
      const parsed = JSON.parse(val)
      setIsValid(true)
      isValidRef.current = true
      onChange(JSON.stringify(parsed))
    } catch {
      setIsValid(false)
      isValidRef.current = false
    }
  }

  const handleMount = (editor) => {
    const format = () => { if (isValidRef.current) editor.getAction('editor.action.formatDocument').run() }
    editor.onDidPaste(format)
    editor.onDidBlurEditorText(format)
  }

  return (
    <div className={`sf-gui-meta-editor${isValid ? '' : ' sf-gui-meta-editor--invalid'}`}>
      <MonacoEditor
        height={160}
        language='json'
        value={editorValue}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          lineNumbers: 'off',
          scrollBeyondLastLine: false,
          fontSize: 12,
          readOnly: disabled || readonly,
          wordWrap: 'on',
          folding: false,
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
        }}
      />
    </div>
  )
}

export default GuiMetadataWidget
