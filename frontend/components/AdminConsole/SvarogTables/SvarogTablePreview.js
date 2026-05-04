import React from 'react'
import { Icon } from '../../../elements'
import { isTrue } from './svarogTableUtils'
const { useState } = React

const FLAG_META = [
  { key: 'SYSTEM_TABLE', label: 'SYSTEM', color: '#7c3aed' },
  { key: 'REPO_TABLE', label: 'REPO', color: '#0891b2' },
  { key: 'IS_CONFIG_TABLE', label: 'CONFIG', color: '#d97706' },
]

const Toggle = ({ checked, onChange }) => (
  <label className='stp-toggle'>
    <input type='checkbox' checked={!!checked} onChange={e => onChange(e.target.checked)} />
    <span className='stp-toggle-track' />
  </label>
)

const SvarogTablePreview = ({ data, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})

  if (!data || !data.TABLE_NAME) return null

  const startEdit = () => {
    setDraft({ ...data })
    setEditing(true)
  }
  const cancel = () => setEditing(false)
  const save = () => { onSave(draft); setEditing(false) }
  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }))

  if (editing) {
    const useCache = isTrue(draft.USE_CACHE)
    return (
      <div className='stp-card stp-card--editing'>
        <div className='stp-edit-row'>
          <div className='stp-edit-field stp-edit-field--wide'>
            <label className='stp-edit-label'>TABLE_NAME</label>
            <input className='stp-edit-input' value={draft.TABLE_NAME || ''} onChange={e => set('TABLE_NAME', e.target.value)} />
          </div>
          <div className='stp-edit-field'>
            <label className='stp-edit-label'>SCHEMA</label>
            <input className='stp-edit-input' value={draft.SCHEMA || ''} onChange={e => set('SCHEMA', e.target.value)} />
          </div>
          <div className='stp-edit-field'>
            <label className='stp-edit-label'>REPO_NAME</label>
            <input className='stp-edit-input' value={draft.REPO_NAME || ''} onChange={e => set('REPO_NAME', e.target.value)} />
          </div>
        </div>
        <div className='stp-edit-row'>
          <div className='stp-edit-field stp-edit-field--wide'>
            <label className='stp-edit-label'>LABEL_CODE</label>
            <input className='stp-edit-input' value={draft.LABEL_CODE || ''} onChange={e => set('LABEL_CODE', e.target.value)} />
          </div>
        </div>
        <div className='stp-edit-row stp-edit-row--flags'>
          {FLAG_META.map(f => (
            <div key={f.key} className='stp-edit-toggle'>
              <Toggle checked={isTrue(draft[f.key])} onChange={v => set(f.key, v)} />
              <span className='stp-edit-toggle-label' style={{ color: f.color }}>{f.label}</span>
            </div>
          ))}
          <div className='stp-edit-toggle'>
            <Toggle checked={isTrue(draft.USE_CACHE)} onChange={v => set('USE_CACHE', v)} />
            <span className='stp-edit-toggle-label'>CACHE</span>
          </div>
        </div>
        {useCache && (
          <div className='stp-edit-row'>
            <div className='stp-edit-field'>
              <label className='stp-edit-label'>CACHE_TYPE</label>
              <input className='stp-edit-input' value={draft.CACHE_TYPE || ''} onChange={e => set('CACHE_TYPE', e.target.value)} />
            </div>
            <div className='stp-edit-field'>
              <label className='stp-edit-label'>CACHE_SIZE</label>
              <input className='stp-edit-input' type='number' value={draft.CACHE_SIZE || ''} onChange={e => set('CACHE_SIZE', e.target.value)} />
            </div>
            <div className='stp-edit-field'>
              <label className='stp-edit-label'>CACHE_EXPIRY</label>
              <input className='stp-edit-input' type='number' value={draft.CACHE_EXPIRY || ''} onChange={e => set('CACHE_EXPIRY', e.target.value)} />
            </div>
          </div>
        )}
        <div className='stp-edit-actions'>
          <button className='stp-btn stp-btn--save' onClick={save}>
            <Icon name='IconCheck' size={14} />
          </button>
          <button className='stp-btn stp-btn--cancel' onClick={cancel}>
            <Icon name='IconX' size={14} />
          </button>
        </div>
      </div>
    )
  }

  const schema = data.SCHEMA || ''
  const repo = data.REPO_NAME || ''
  const qualifier = [schema, repo].filter(Boolean).join(' / ')
  const useCache = isTrue(data.USE_CACHE)
  const activeFlags = FLAG_META.filter(f => isTrue(data[f.key]))

  return (
    <div className='stp-card'>
      <div className='stp-header'>
        <span className='stp-table-name'>{data.TABLE_NAME}</span>
        {qualifier && <span className='stp-qualifier'>{qualifier}</span>}
        <button className='stp-edit-btn' onClick={startEdit} title='Edit table'>
          <Icon name='IconPencil' size={18} />
        </button>
      </div>
      <div className='stp-meta-row'>
        {data.LABEL_CODE && <span className='stp-label-code'>{data.LABEL_CODE}</span>}
        <div className='stp-badges'>
          {activeFlags.map(f => (
            <span key={f.key} className='stp-badge' style={{ background: f.color }}>{f.label}</span>
          ))}
          {useCache && (
            <span className='stp-badge stp-badge--cache'>
              CACHE{data.CACHE_TYPE ? `: ${data.CACHE_TYPE}` : ''}
              {data.CACHE_SIZE ? ` · ${data.CACHE_SIZE}` : ''}
              {data.CACHE_EXPIRY ? ` · ${data.CACHE_EXPIRY}s` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SvarogTablePreview
