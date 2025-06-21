"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Type, ChevronDown, Circle, Table, Download, Settings, Trash2, Plus, Minus, GripVertical } from "lucide-react"
import { PDFDocument, StandardFonts } from "pdf-lib"

interface FormField {
  id: string
  type: "input" | "select" | "radio" | "table"
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  rows?: number
  columns?: string[]
  tableData?: string[][]
}

interface DragItem {
  type: "input" | "select" | "radio" | "table"
  label: string
}

const fieldTypes: DragItem[] = [
  { type: "input", label: "Text Input" },
  { type: "select", label: "Dropdown" },
  { type: "radio", label: "Radio Button" },
  { type: "table", label: "Table" },
]

export default function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [draggedType, setDraggedType] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState("Untitled Form")
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleDragStart = (type: string) => {
    setDraggedType(type)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedType) return

    const newField: FormField = {
      id: generateId(),
      type: draggedType as FormField["type"],
      label: `${draggedType.charAt(0).toUpperCase() + draggedType.slice(1)} Field`,
      required: false,
      placeholder: draggedType === "input" ? "Enter text..." : undefined,
      options: draggedType === "select" || draggedType === "radio" ? ["Option 1", "Option 2"] : undefined,
      columns: draggedType === "table" ? ["Column 1", "Column 2"] : undefined,
      tableData:
        draggedType === "table"
          ? [
              ["", ""],
              ["", ""],
            ]
          : undefined,
      rows: draggedType === "table" ? 2 : undefined,
    }

    setFields((prev) => [...prev, newField])
    setDraggedType(null)
    setSelectedField(newField.id)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)))
  }

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id))
    if (selectedField === id) {
      setSelectedField(null)
    }
  }

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, `Option ${field.options.length + 1}`],
      })
    }
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.options && field.options.length > 1) {
      updateField(fieldId, {
        options: field.options.filter((_, index) => index !== optionIndex),
      })
    }
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.options) {
      const newOptions = [...field.options]
      newOptions[optionIndex] = value
      updateField(fieldId, { options: newOptions })
    }
  }

  const addTableRow = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.tableData && field.columns) {
      const newRow = new Array(field.columns.length).fill("")
      updateField(fieldId, {
        tableData: [...field.tableData, newRow],
        rows: (field.rows || 0) + 1,
      })
    }
  }

  const addTableColumn = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.tableData && field.columns) {
      const newColumns = [...field.columns, `Column ${field.columns.length + 1}`]
      const newTableData = field.tableData.map((row) => [...row, ""])
      updateField(fieldId, {
        columns: newColumns,
        tableData: newTableData,
      })
    }
  }

  const updateTableColumn = (fieldId: string, columnIndex: number, value: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (field && field.columns) {
      const newColumns = [...field.columns]
      newColumns[columnIndex] = value
      updateField(fieldId, { columns: newColumns })
    }
  }

  const generatePDF = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create()
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const page = pdfDoc.addPage([612, 792])
      const { width, height } = page.getSize()

      // Get the form
      const form = pdfDoc.getForm()

      let yPosition = height - 50

      // Add form title
      page.drawText(formTitle, {
        x: 50,
        y: yPosition,
        size: 20,
      })
      yPosition -= 60

      // Add fields to PDF
      for (const field of fields) {
        // Check if we need a new page
        if (yPosition < 150) {
          const newPage = pdfDoc.addPage([612, 792])
          yPosition = height - 50
        }

        // Add field label
        page.drawText(field.label + (field.required ? " *" : ""), {
          x: 50,
          y: yPosition,
          size: 12,
        })
        yPosition -= 25

        try {
          switch (field.type) {
            case "input":
              // Create and configure text field
              const textField = form.createTextField(`text_${field.id}`)

              // Set the field rectangle
              textField.addToPage(page, {
                x: 50,
                y: yPosition - 25,
                width: 300,
                height: 25,
              })

              // Configure field properties
              textField.setText("")
              textField.setFontSize(12)
              textField.enableMultiline(false)
              textField.setMaxLength(500)

              // Force field appearance
              textField.defaultUpdateAppearances(helveticaFont)

              yPosition -= 45
              break

            case "select":
              if (field.options && field.options.length > 0) {
                const dropdown = form.createDropdown(`select_${field.id}`)

                dropdown.addToPage(page, {
                  x: 50,
                  y: yPosition - 25,
                  width: 200,
                  height: 25,
                })

                // Add options
                dropdown.addOptions(field.options)
                dropdown.setFontSize(12)
                dropdown.defaultUpdateAppearances(helveticaFont)

                yPosition -= 45
              }
              break

            case "radio":
              if (field.options && field.options.length > 0) {
                const radioGroup = form.createRadioGroup(`radio_${field.id}`)

                field.options.forEach((option, index) => {
                  const optionY = yPosition - index * 25

                  // Add option text
                  page.drawText(option, {
                    x: 80,
                    y: optionY - 5,
                    size: 11,
                  })

                  // Add radio button
                  radioGroup.addOptionToPage(option, page, {
                    x: 55,
                    y: optionY - 8,
                    width: 12,
                    height: 12,
                  })
                })

                radioGroup.defaultUpdateAppearances()
                yPosition -= field.options.length * 25 + 20
              }
              break

            case "table":
              if (field.columns && field.tableData && field.columns.length > 0) {
                const colWidth = Math.min(100, (width - 100) / field.columns.length)

                // Draw headers
                field.columns.forEach((column, colIndex) => {
                  page.drawText(column, {
                    x: 50 + colIndex * colWidth,
                    y: yPosition,
                    size: 10,
                  })
                })
                yPosition -= 25

                // Create table cells
                field.tableData.forEach((row, rowIndex) => {
                  row.forEach((cell, colIndex) => {
                    const cellField = form.createTextField(`table_${field.id}_${rowIndex}_${colIndex}`)

                    cellField.addToPage(page, {
                      x: 50 + colIndex * colWidth,
                      y: yPosition - 20,
                      width: colWidth - 5,
                      height: 18,
                    })

                    cellField.setText("")
                    cellField.setFontSize(9)
                    cellField.enableMultiline(false)
                    cellField.setMaxLength(100)
                    cellField.defaultUpdateAppearances(helveticaFont)
                  })
                  yPosition -= 25
                })
                yPosition -= 15
              }
              break
          }
        } catch (fieldError) {
          console.warn(`Error creating field ${field.id}:`, fieldError)
          yPosition -= 50
        }

        yPosition -= 15
      }

      // Update all form field appearances
      const formFields = form.getFields()
      console.log(`Created ${formFields.length} form fields`)
      form.updateFieldAppearances(helveticaFont)

      // Save PDF with form
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
      })

      // Download
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${formTitle.replace(/[^a-zA-Z0-9]/g, "_")}_form.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("PDF generated with fillable form fields!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const selectedFieldData = selectedField ? fields.find((f) => f.id === selectedField) : null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Field Types */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
        <div className="space-y-2">
          {fieldTypes.map((fieldType) => (
            <Card
              key={fieldType.type}
              className="cursor-move hover:shadow-md transition-shadow"
              draggable
              onDragStart={() => handleDragStart(fieldType.type)}
            >
              <CardContent className="p-3 flex items-center space-x-2">
                {fieldType.type === "input" && <Type className="w-4 h-4" />}
                {fieldType.type === "select" && <ChevronDown className="w-4 h-4" />}
                {fieldType.type === "radio" && <Circle className="w-4 h-4" />}
                {fieldType.type === "table" && <Table className="w-4 h-4" />}
                <span className="text-sm">{fieldType.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content - Form Builder */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-lg font-semibold border-none shadow-none p-0 h-auto"
            />
            <Badge variant="secondary">{fields.length} fields</Badge>
          </div>
          <Button onClick={generatePDF} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
        </div>

        {/* Form Canvas */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <div
              ref={dropZoneRef}
              className="min-h-full border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {fields.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-lg mb-2">Drag and drop form elements here</div>
                  <div className="text-sm">Start building your form by dragging elements from the sidebar</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {fields.map((field) => (
                    <Card
                      key={field.id}
                      className={`cursor-pointer transition-all ${
                        selectedField === field.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedField(field.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <Label className="font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteField(field.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Field Preview */}
                        {field.type === "input" && <Input placeholder={field.placeholder} disabled />}

                        {field.type === "select" && field.options && (
                          <Select disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </Select>
                        )}

                        {field.type === "radio" && field.options && (
                          <RadioGroup disabled>
                            {field.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} />
                                <Label>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {field.type === "table" && field.columns && field.tableData && (
                          <div className="border rounded">
                            <div className="grid grid-cols-2 gap-0">
                              {field.columns.map((column, colIndex) => (
                                <div key={colIndex} className="p-2 bg-gray-50 border-b font-medium text-sm">
                                  {column}
                                </div>
                              ))}
                              {field.tableData.map((row, rowIndex) =>
                                row.map((cell, colIndex) => (
                                  <div key={`${rowIndex}-${colIndex}`} className="p-2 border-b">
                                    <Input className="h-8" disabled />
                                  </div>
                                )),
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Configuration Panel */}
          {selectedFieldData && (
            <div className="w-80 bg-white border-l border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-4 h-4" />
                <h3 className="font-semibold">Field Settings</h3>
              </div>

              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="field-label">Label</Label>
                    <Input
                      id="field-label"
                      value={selectedFieldData.label}
                      onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="field-required"
                      checked={selectedFieldData.required}
                      onCheckedChange={(checked) => updateField(selectedFieldData.id, { required: checked as boolean })}
                    />
                    <Label htmlFor="field-required">Required field</Label>
                  </div>

                  {selectedFieldData.type === "input" && (
                    <div>
                      <Label htmlFor="field-placeholder">Placeholder</Label>
                      <Input
                        id="field-placeholder"
                        value={selectedFieldData.placeholder || ""}
                        onChange={(e) => updateField(selectedFieldData.id, { placeholder: e.target.value })}
                      />
                    </div>
                  )}

                  {(selectedFieldData.type === "select" || selectedFieldData.type === "radio") && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Options</Label>
                        <Button size="sm" variant="outline" onClick={() => addOption(selectedFieldData.id)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedFieldData.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(selectedFieldData.id, index, e.target.value)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOption(selectedFieldData.id, index)}
                              disabled={selectedFieldData.options!.length <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedFieldData.type === "table" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Columns</Label>
                          <Button size="sm" variant="outline" onClick={() => addTableColumn(selectedFieldData.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {selectedFieldData.columns?.map((column, index) => (
                            <Input
                              key={index}
                              value={column}
                              onChange={(e) => updateTableColumn(selectedFieldData.id, index, e.target.value)}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Rows</Label>
                          <Button size="sm" variant="outline" onClick={() => addTableRow(selectedFieldData.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">Current rows: {selectedFieldData.rows || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
