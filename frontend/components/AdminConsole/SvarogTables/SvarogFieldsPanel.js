import React from 'react'
import { Icon } from '../../../elements'

const TYPE_STYLE = {
  NVARCHAR: { background: '#dbeafe', color: '#1d4ed8' },
  VARCHAR: { background: '#dbeafe', color: '#1d4ed8' },
  CHAR: { background: '#dbeafe', color: '#1d4ed8' },
  TEXT: { background: '#dbeafe', color: '#1d4ed8' },
  NUMERIC: { background: '#dcfce7', color: '#166534' },
  INTEGER: { background: '#dcfce7', color: '#166534' },
  BIGINT: { background: '#dcfce7', color: '#166534' },
  SMALLINT: { background: '#dcfce7', color: '#166534' },
  DECIMAL: { background: '#dcfce7', color: '#166534' },
  FLOAT: { background: '#dcfce7', color: '#166534' },
  DATE: { background: '#f3e8ff', color: '#6b21a8' },
  TIMESTAMP: { background: '#f3e8ff', color: '#6b21a8' },
  DATETIME: { background: '#f3e8ff', color: '#6b21a8' },
  BOOLEAN: { background: '#fff7ed', color: '#c2410c' },
  BIT: { background: '#fff7ed', color: '#c2410c' },
}
const DEFAULT_TYPE_STYLE = { background: '#f1f5f9', color: '#475569' }

const TypeBadge = ({ type }) => (
  <span className='sf-type-badge' style={TYPE_STYLE[type] || DEFAULT_TYPE_STYLE}>{type}</span>
)

const ConstraintBadge = ({ label, color }) => (
  <span className='sf-constraint-badge' style={{ background: color }}>{label}</span>
)

const SvarogFieldsPanel = ({ fields, selectedObjectId, onSelect, onAdd, addLabel }) => (
  <div className='sf-entity-rows'>
    {fields.map((field, idx) => {
      const objectId = field.OBJECT_ID
      const isPk = field.IS_PRIMARY_KEY === 'yes' || field.IS_PRIMARY_KEY === true
      const isNotNull = field.IS_NULL === 'no' || field.IS_NULL === false
      const isUnique = field.IS_UNIQUE === 'yes' || field.IS_UNIQUE === true
      const hasIndex = !!field.INDEX_NAME
      const hasCodeList = !!field.CODE_LIST_MNEMONIC
      const isSelected = objectId != null && objectId === selectedObjectId
      const isPending = !!field._pending
      const isNew = !!field._new
      const label = field.LABEL_CODE || ''
      const isI18nLabel = label.includes('.') && !label.includes(' ')

      let cls = 'sf-field-row'
      if (isPk) cls += ' sf-field-row--pk'
      if (isSelected) cls += ' sf-field-row--selected'
      else if (isPending) cls += ' sf-field-row--pending'

      return (
        <div
          key={objectId != null ? objectId : `new-${idx}`}
          className={cls}
          onClick={() => !isNew && onSelect(objectId)}
          style={{ cursor: isNew ? 'default' : 'pointer' }}
        >
          <span className='sf-sort-order'>{field.SORT_ORDER ?? '—'}</span>
          <span className='sf-pk-icon'>
            {isPk && <Icon name='IconKey' size={14} />}
          </span>
          <span className='sf-field-info'>
            <span className='sf-field-name'>{field.FIELD_NAME || '(new field)'}</span>
            {!isI18nLabel && label && <span className='sf-field-label' title={label}>{label}</span>}
            {hasCodeList && <span className='sf-codelist-tag' title={field.CODE_LIST_MNEMONIC}>{field.CODE_LIST_MNEMONIC}</span>}
          </span>
          <span className='sf-type-cell'>
            <TypeBadge type={field.FIELD_TYPE || '—'} />
            {field.FIELD_SIZE != null && <span className='sf-field-size'>({field.FIELD_SIZE})</span>}
          </span>
          <span className='sf-constraints'>
            {isPk && <ConstraintBadge label='PK' color='#92400e' />}
            {isNotNull && !isPk && <ConstraintBadge label='MANDATORY' color='#dc2626' />}
            {isUnique && <ConstraintBadge label='UNIQUE' color='#d97706' />}
            {hasIndex && <ConstraintBadge label='INDEX' color='#0891b2' />}
          </span>
        </div>
      )
    })}
    <div className='sf-field-row sf-field-row--add' onClick={onAdd}>
      + {addLabel}
    </div>
  </div>
)

export default SvarogFieldsPanel
