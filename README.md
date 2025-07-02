# PDF Form Builder Module

This package exposes a `QrFormBuilder` React component that can be used to build simple forms that emit a QR code on save. It can be published to npm and consumed in other projects.

## Installation

```
npm install pdf-form-builder
```

## Usage

```tsx
import { QrFormBuilder } from 'pdf-form-builder'

const fields = [
  { fieldKey: 'name', type: 'input' },
  { fieldKey: 'pets', type: 'dynamic-input' },
  { fieldKey: 'color', type: 'select', options: ['red','blue'] },
]

export default function App() {
  return <QrFormBuilder fields={fields} onSave={(data, qr) => console.log(data, qr)} />
}
```

When the save button is clicked a QR code is generated. The payload has the structure `{"fieldKey":"value"}` for every configured field.

## Field Types

| Type            | Description                                                    |
|-----------------|----------------------------------------------------------------|
| `dynamic-input` | Array of inputs with `+` and `-` buttons to add or remove rows |
| `select`        | HTML `select` element. Use `options` for choices and `multiple` for multi-select |
| `input`         | Single text input                                              |
| `textarea`      | Multi line text input                                          |
| `currency`      | Numeric input accepting decimals                               |
| `country`       | Dropdown populated with ISO country codes                      |
| `address`       | Simple address text input                                      |
| `radio`         | Radio buttons. Use `options` for choices                       |

Validation and visibility logic currently run only when the **Save** button is clicked. Instant updates are not supported.

## Testing

Run the test suite with:

```
npm run test
```
