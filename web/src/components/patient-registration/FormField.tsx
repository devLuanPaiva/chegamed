"use client";

import type { ChangeEvent } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  label,
  name,
  type = "text",
  error,
  required,
  placeholder,
  maxLength,
  onChange,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-neutral-800">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition-colors focus:border-primary-500 ${
          error ? "border-danger" : "border-neutral-300"
        }`}
      />
      {error && <span className="text-xs font-semibold text-danger">{error}</span>}
    </label>
  );
}
