export interface ApiFieldError {
  code: string;
  field: string | null;
  detail: string;
}

export interface ApiSuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiErrorBody {
  status: string;
  message: string;
  data: unknown;
  errors: ApiFieldError[];
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly errors: ApiFieldError[];

  constructor(status: number, message: string, errors: ApiFieldError[]) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }

  fieldError(field: string): string | undefined {
    return this.errors.find((error) => error.field === field)?.detail;
  }

  hasCode(code: string): boolean {
    return this.errors.some((error) => error.code === code);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error("A variável de ambiente API_BASE_URL não está configurada.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiClientError(
      response.status,
      errorBody?.message ?? "Não foi possível completar a solicitação.",
      errorBody?.errors ?? [],
    );
  }

  return (body as ApiSuccessBody<T>).data;
}
