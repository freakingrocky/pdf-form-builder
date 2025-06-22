# PDF Form Builder

A simple React form builder component that can generate a QR code with the form data. Fields are described with objects of the form:

```ts
{
  fieldKey: string;
  type: 'input' | 'textarea' | 'dynamicInput' | 'select' | 'selectMany' | 'currency' | 'country' | 'address' | 'radio';
  label?: string;
  options?: string[]; // for select and radio types
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  visibility?: { fieldKey: string; value: string };
}
```

Pass an array of field definitions to the `DynamicForm` component.

```tsx
import { DynamicForm } from 'pdf-form-builder'

const fields = [
  { fieldKey: 'name', type: 'input' },
  { fieldKey: 'comments', type: 'textarea' },
  { fieldKey: 'items', type: 'dynamicInput' },
  { fieldKey: 'country', type: 'country' },
  { fieldKey: 'currency', type: 'currency' },
  { fieldKey: 'address', type: 'address' },
  { fieldKey: 'fruit', type: 'select', options: ['Apple', 'Orange'] },
  { fieldKey: 'colors', type: 'selectMany', options: ['Red', 'Green'] },
  { fieldKey: 'gender', type: 'radio', options: ['Male', 'Female'] }
]

<DynamicForm fields={fields} />
```

Clicking **Save** will produce a QR code representing an object with the collected values:

```json
{"name":"John","country":"US",...}
```

## Field types

- **Input** – simple text input
- **Textarea** – multi line text input
- **Dynamic Input** – list of inputs with add/remove buttons
- **Select** – single select dropdown
- **Select Many** – multi select
- **Currency Input** – numeric input for money values
- **Country Input** – dropdown with a few countries
- **Address** – single line address input
- **Radio Button** – choose one option

Validation and conditional visibility only run when the **Save** button is clicked.
