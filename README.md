# PDF Form Builder Module

This package exposes a `FormModule` React component that renders forms from a configuration array and generates a QR code on **Save**. It can be published to npm and consumed in any React project.

## Installation

```bash
npm install pdf-form-builder
```

## Usage

```tsx
import { FormModule, FieldConfig } from "pdf-form-builder";

const fields: FieldConfig[] = [
  { fieldKey: "name", type: "input", label: "Name", validation: { required: true } },
  { fieldKey: "age", type: "currency", label: "Age" },
];

export default function MyForm() {
  return <FormModule fields={fields} />;
}
```

When the user clicks **Save**, the component validates visible fields and, if valid, displays a QR code with the form values in the format:

```json
{"fieldKey":"value"}
```

Visibility and validation logic currently run only on **Save**.

## Field Types

| Type            | Description                                          |
| --------------- | ---------------------------------------------------- |
| `input`         | Standard text input                                  |
| `textarea`      | Multi-line text area                                 |
| `currency`      | Number input with decimal support                    |
| `country`       | Country selector with a small built-in list          |
| `select`        | Single select dropdown                               |
| `select-many`   | Multiple select dropdown                             |
| `dynamic-input` | Add or remove multiple text inputs using +/- buttons |
| `address`       | Street, city and ZIP inputs                          |
| `radio`         | Radio button group                                   |

Each field can include:

```ts
interface FieldConfig {
  fieldKey: string;
  type: FieldType;
  label?: string;
  options?: string[]; // for select/radio fields
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  visibility?: {
    fieldKey: string; // controlling field
    value: string;    // show when value equals this
  };
}
```

## Testing

Run all tests with:

```bash
npm test
```
