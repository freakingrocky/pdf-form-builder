import React, { useState } from 'react'
import QRCode from 'qrcode'

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
}

export type FieldType =
  | 'input'
  | 'textarea'
  | 'dynamicInput'
  | 'select'
  | 'selectMany'
  | 'currency'
  | 'country'
  | 'address'
  | 'radio'

export interface FieldDefinition {
  fieldKey: string
  type: FieldType
  label?: string
  options?: string[]
  validation?: FieldValidation
  visibility?: { fieldKey: string; value: string }
}

interface Props {
  fields: FieldDefinition[]
}

export const DynamicForm: React.FC<Props> = ({ fields }) => {
  const [values, setValues] = useState<Record<string, any>>({})
  const [qr, setQr] = useState<string>('')

  const handleChange = (key: string, value: any) => {
    setValues((v) => ({ ...v, [key]: value }))
  }

  const visible = (field: FieldDefinition) => {
    if (!field.visibility) return true
    return values[field.visibility.fieldKey] === field.visibility.value
  }

  const handleAddDynamic = (key: string) => {
    const arr = Array.isArray(values[key]) ? values[key] : ['']
    setValues((v) => ({ ...v, [key]: [...arr, ''] }))
  }
  const handleRemoveDynamic = (key: string, idx: number) => {
    const arr = Array.isArray(values[key]) ? [...values[key]] : []
    arr.splice(idx, 1)
    setValues((v) => ({ ...v, [key]: arr }))
  }

  const handleDynamicChange = (key: string, idx: number, val: string) => {
    const arr = Array.isArray(values[key]) ? [...values[key]] : []
    arr[idx] = val
    setValues((v) => ({ ...v, [key]: arr }))
  }

  const onSave = async () => {
    const data = fields.reduce<Record<string, any>>((acc, f) => {
      acc[f.fieldKey] = values[f.fieldKey]
      return acc
    }, {})
    const url = await QRCode.toDataURL(JSON.stringify(data))
    setQr(url)
  }

  return (
    <div>
      {fields.map((field) =>
        visible(field) ? (
          <div key={field.fieldKey} style={{ marginBottom: '1rem' }}>
            <label htmlFor={field.fieldKey}>{field.label || field.fieldKey}</label>
            {field.type === 'input' && (
              <input
                id={field.fieldKey}
                type="text"
                value={values[field.fieldKey] || ''}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                id={field.fieldKey}
                value={values[field.fieldKey] || ''}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === 'currency' && (
              <input
                id={field.fieldKey}
                type="number"
                step="0.01"
                value={values[field.fieldKey] || ''}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === 'country' && (
              <select
                id={field.fieldKey}
                value={values[field.fieldKey] || ''}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
              </select>
            )}
            {field.type === 'address' && (
              <input
                id={field.fieldKey}
                type="text"
                value={values[field.fieldKey] || ''}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === 'select' && (
              <select
                id={field.fieldKey}
                value={values[field.fieldKey] || ''}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              >
                <option value="">Select</option>
                {field.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'selectMany' && (
              <select
                id={field.fieldKey}
                multiple
                value={values[field.fieldKey] || []}
                onChange={(e) =>
                  handleChange(
                    field.fieldKey,
                    Array.from(e.target.selectedOptions, (o) => o.value)
                  )
                }
              >
                {field.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'radio' && (
              <div>
                {field.options?.map((o) => (
                  <label key={o} style={{ marginRight: '1rem' }}>
                    <input
                      id={`${field.fieldKey}-${o}`}
                      type="radio"
                      name={field.fieldKey}
                      value={o}
                      checked={values[field.fieldKey] === o}
                      onChange={(e) => handleChange(field.fieldKey, e.target.value)}
                    />
                    {o}
                  </label>
                ))}
              </div>
            )}
            {field.type === 'dynamicInput' && (
              <div>
                {(values[field.fieldKey] || ['']).map((val: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      id={`${field.fieldKey}-${idx}`}
                      type="text"
                      value={val}
                      onChange={(e) =>
                        handleDynamicChange(field.fieldKey, idx, e.target.value)
                      }
                    />
                    <button onClick={() => handleRemoveDynamic(field.fieldKey, idx)}>-</button>
                  </div>
                ))}
                <button onClick={() => handleAddDynamic(field.fieldKey)}>+</button>
              </div>
            )}
          </div>
        ) : null
      )}
      <button onClick={onSave}>Save</button>
      {qr && <img src={qr} alt="qr" />}
    </div>
  )
}

export default DynamicForm
