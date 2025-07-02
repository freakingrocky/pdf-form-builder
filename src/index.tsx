import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import QRCode from 'qrcode'

export type FieldType =
  | 'dynamic-input'
  | 'select'
  | 'input'
  | 'textarea'
  | 'currency'
  | 'country'
  | 'address'
  | 'radio'

export interface FieldConfig {
  fieldKey: string
  type: FieldType
  validation?: string
  options?: string[]
  multiple?: boolean
}

interface Props {
  fields: FieldConfig[]
  onSave?: (data: Record<string, unknown>, qrDataUrl: string) => void
}

export function QrFormBuilder({ fields, onSave }: Props) {
  const { register, handleSubmit, control } = useForm<Record<string, any>>()

  const dynamicArrays = fields
    .filter((f) => f.type === 'dynamic-input')
    .reduce((acc, f) => {
      acc[f.fieldKey] = useFieldArray({ control, name: f.fieldKey })
      return acc
    }, {} as Record<string, ReturnType<typeof useFieldArray>>)

  const submit = async (values: Record<string, any>) => {
    const qrString = JSON.stringify(values)
    const qrDataUrl = await QRCode.toDataURL(qrString)
    onSave?.(values, qrDataUrl)
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      {fields.map((f) => {
        if (f.type === 'dynamic-input') {
          const arr = dynamicArrays[f.fieldKey]
          return (
            <div key={f.fieldKey}>
              {arr.fields.map((item, idx) => (
                <input key={item.id} {...register(`${f.fieldKey}.${idx}`)} />
              ))}
              <button type='button' onClick={() => arr.append('')}>+</button>
              <button type='button' onClick={() => arr.remove(arr.fields.length - 1)} disabled={arr.fields.length===0}>-</button>
            </div>
          )
        }
        if (f.type === 'select') {
          return (
            <select key={f.fieldKey} {...register(f.fieldKey)} multiple={f.multiple}>
              {f.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )
        }
        if (f.type === 'textarea') {
          return <textarea key={f.fieldKey} {...register(f.fieldKey)} />
        }
        if (f.type === 'currency') {
          return <input key={f.fieldKey} type='number' step='0.01' {...register(f.fieldKey)} />
        }
        if (f.type === 'country') {
          return (
            <select key={f.fieldKey} {...register(f.fieldKey)}>
              {Intl.supportedValuesOf('region').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )
        }
        if (f.type === 'address') {
          return <input key={f.fieldKey} placeholder='Address' {...register(f.fieldKey)} />
        }
        if (f.type === 'radio') {
          return (
            <div key={f.fieldKey}>
              {f.options?.map((o) => (
                <label key={o}>
                  <input type='radio' value={o} {...register(f.fieldKey)} />
                  {o}
                </label>
              ))}
            </div>
          )
        }
        return <input key={f.fieldKey} {...register(f.fieldKey)} />
      })}
      <button type='submit'>Save</button>
    </form>
  )
}

export default QrFormBuilder
