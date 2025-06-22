import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type FieldType =
  | "input"
  | "textarea"
  | "select"
  | "select-many"
  | "dynamic-input"
  | "currency"
  | "country"
  | "address"
  | "radio";

export interface FieldConfig {
  fieldKey: string;
  type: FieldType;
  label?: string;
  options?: string[];
  multiple?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  visibility?: {
    fieldKey: string;
    value: string;
  };
}

export interface FormModuleProps {
  fields: FieldConfig[];
}

export const FormModule: React.FC<FormModuleProps> = ({ fields }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQR, setShowQR] = useState(false);

  const visible = (f: FieldConfig) => {
    if (!f.visibility) return true;
    return values[f.visibility.fieldKey] === f.visibility.value;
  };

  const handleChange = (key: string, value: any) => {
    setValues((v) => ({ ...v, [key]: value }));
  };

  const addDynamic = (key: string) => {
    const arr: string[] = values[key] || [""];
    handleChange(key, [...arr, ""]);
  };

  const removeDynamic = (key: string, idx: number) => {
    const arr: string[] = values[key] || [];
    handleChange(
      key,
      arr.filter((_, i) => i !== idx)
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (!visible(f)) return;
      const val = values[f.fieldKey];
      if (f.validation?.required && (val === undefined || val === "" || (Array.isArray(val) && val.length === 0))) {
        newErrors[f.fieldKey] = "Required";
      }
      if (typeof val === "string") {
        if (f.validation?.minLength && val.length < f.validation.minLength) {
          newErrors[f.fieldKey] = `Min ${f.validation.minLength}`;
        }
        if (f.validation?.maxLength && val.length > f.validation.maxLength) {
          newErrors[f.fieldKey] = `Max ${f.validation.maxLength}`;
        }
      }
    });
    setErrors(newErrors);
    return newErrors;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length === 0) {
      setShowQR(true);
    } else {
      setShowQR(false);
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        visible(field) && (
          <div key={field.fieldKey} className="space-y-1">
          {field.label && <Label htmlFor={field.fieldKey}>{field.label}</Label>}
          {field.type === "input" && (
              <Input
                id={field.fieldKey}
                value={values[field.fieldKey] || ""}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === "textarea" && (
              <Textarea
                id={field.fieldKey}
                value={values[field.fieldKey] || ""}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === "currency" && (
              <Input
                id={field.fieldKey}
                type="number"
                step="0.01"
                value={values[field.fieldKey] || ""}
                onChange={(e) => handleChange(field.fieldKey, e.target.value)}
              />
            )}
            {field.type === "country" && (
              <Select
                value={values[field.fieldKey] || ""}
                onValueChange={(val) => handleChange(field.fieldKey, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === "select" && (
              <Select
                value={values[field.fieldKey] || ""}
                onValueChange={(val) => handleChange(field.fieldKey, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === "select-many" && (
              <Select
                multiple
                value={values[field.fieldKey] || []}
                onValueChange={(val) => handleChange(field.fieldKey, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.type === "radio" && (
              <RadioGroup
                value={values[field.fieldKey] || ""}
                onValueChange={(val) => handleChange(field.fieldKey, val)}
              >
                {field.options?.map((o) => (
                  <div key={o} className="flex items-center space-x-2">
                    <RadioGroupItem value={o} />
                    <Label>{o}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {field.type === "dynamic-input" && (
              <div className="space-y-2">
                {(values[field.fieldKey] || [""]).map((v: string, idx: number) => (
                  <div key={idx} className="flex space-x-2">
                    <Input
                      value={v}
                      onChange={(e) => {
                        const arr = [...(values[field.fieldKey] || [""])];
                        arr[idx] = e.target.value;
                        handleChange(field.fieldKey, arr);
                      }}
                    />
                    <Button type="button" onClick={() => removeDynamic(field.fieldKey, idx)}>
                      -
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => addDynamic(field.fieldKey)}>
                  +
                </Button>
              </div>
            )}
            {field.type === "address" && (
              <div className="space-y-1">
                <Input
                  placeholder="Street"
                  value={(values[field.fieldKey]?.street) || ""}
                  onChange={(e) => handleChange(field.fieldKey, { ...values[field.fieldKey], street: e.target.value })}
                />
                <Input
                  placeholder="City"
                  value={(values[field.fieldKey]?.city) || ""}
                  onChange={(e) => handleChange(field.fieldKey, { ...values[field.fieldKey], city: e.target.value })}
                />
                <Input
                  placeholder="ZIP"
                  value={(values[field.fieldKey]?.zip) || ""}
                  onChange={(e) => handleChange(field.fieldKey, { ...values[field.fieldKey], zip: e.target.value })}
                />
              </div>
            )}
            {errors[field.fieldKey] && <div className="text-red-600 text-sm">{errors[field.fieldKey]}</div>}
          </div>
        )
      ))}
      <Button onClick={handleSave}>Save</Button>
      {showQR && (
        <div className="mt-4">
          <QRCodeSVG value={JSON.stringify(values)} />
        </div>
      )}
    </div>
  );
};

const countryList = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Australia",
  "Japan",
];

export default FormModule;
