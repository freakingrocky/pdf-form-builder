import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import React from "react";
import { FormModule, FieldConfig } from "../lib/FormModule";

describe("FormModule", () => {
  it("renders fields and generates QR code on save", () => {
    const fields: FieldConfig[] = [
      { fieldKey: "name", type: "input", label: "Name", validation: { required: true } },
    ];
    render(<FormModule fields={fields} />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "John" } });
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
