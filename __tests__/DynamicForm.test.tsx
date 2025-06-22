import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { DynamicForm, FieldDefinition } from '../src/DynamicForm'

describe('DynamicForm', () => {
  it('renders fields and generates qr on save', async () => {
    const fields: FieldDefinition[] = [
      { fieldKey: 'name', type: 'input' },
      { fieldKey: 'country', type: 'country' }
    ]
    render(<DynamicForm fields={fields} />)
    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('country'), { target: { value: 'US' } })
    fireEvent.click(screen.getByText('Save'))
    const img = await screen.findByAltText('qr')
    expect(img).toBeInTheDocument()
  })
})
