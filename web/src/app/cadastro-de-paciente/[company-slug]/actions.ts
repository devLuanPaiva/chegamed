"use server";

import { z } from "zod";

import { ApiClientError, apiFetch } from "@/lib/api-client";

const registrationSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome completo").max(120, "Nome muito longo"),
    cpf: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().length(11, "CPF inválido")),
    birthDate: z.string().min(1, "Informe a data de nascimento"),
    contact: z.string().trim().max(20, "Contato muito longo").optional(),
    address: z.string().trim().max(255, "Endereço muito longo").optional(),
    email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido").max(180),
    password: z.string().min(6, "A senha deve ter entre 6 e 20 caracteres").max(20),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export interface PatientRegistrationFormState {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const INITIAL_FORM_STATE: PatientRegistrationFormState = { success: false };

export async function submitPatientRegistration(
  companySlug: string,
  _prevState: PatientRegistrationFormState,
  formData: FormData,
): Promise<PatientRegistrationFormState> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    cpf: formData.get("cpf")?.toString() ?? "",
    birthDate: formData.get("birthDate")?.toString() ?? "",
    contact: formData.get("contact")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    confirmPassword: formData.get("confirmPassword")?.toString() ?? "",
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZodIssues(parsed.error.issues) };
  }

  try {
    await apiFetch<void>(`/public/companies/${companySlug}/patient-registration-requests`, {
      method: "POST",
      body: JSON.stringify({
        name: parsed.data.name,
        cpf: parsed.data.cpf,
        birthDate: parsed.data.birthDate,
        contact: parsed.data.contact || null,
        address: parsed.data.address || null,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    return { success: true };
  } catch (error) {
    return { success: false, ...mapApiError(error) };
  }
}

function flattenZodIssues(issues: z.ZodIssue[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0]?.toString();
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

const FORM_FIELD_NAMES = new Set([
  "name",
  "cpf",
  "birthDate",
  "contact",
  "address",
  "email",
  "password",
]);

function mapApiError(error: unknown): Pick<PatientRegistrationFormState, "message" | "fieldErrors"> {
  if (!(error instanceof ApiClientError)) {
    return { message: "Não foi possível enviar o cadastro. Tente novamente mais tarde." };
  }

  if (error.errors.length === 0) {
    return { message: error.message };
  }

  const fieldErrors: Record<string, string> = {};
  let message: string | undefined;

  for (const fieldError of error.errors) {
    if (fieldError.field && FORM_FIELD_NAMES.has(fieldError.field)) {
      fieldErrors[fieldError.field] = fieldError.detail;
    } else {
      message = fieldError.detail;
    }
  }

  return { message, fieldErrors };
}
