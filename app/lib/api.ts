/**
 * Thin fetch wrapper for the Express API in /server. Every call sends cookies
 * (credentials: "include"), which is how the session cookie set by /api/auth
 * reaches the backend — in dev through Vite's /api proxy, in production because
 * the backend serves the frontend itself, so both are already the same origin.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Plain object -> sent as JSON. FormData -> sent as-is (multipart), for file uploads. */
  body?: unknown;
}

async function request<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const isFormData = body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: "include",
      headers: isFormData || body === undefined ? undefined : { "Content-Type": "application/json" },
      body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection.", 0, "network");
  }

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      typeof data?.error === "string" ? data.error : "Something went wrong. Try again.",
      response.status,
      typeof data?.code === "string" ? data.code : "error",
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const resumeFileUrl = (id: string) => `/api/resumes/${id}/resume.pdf`;
export const resumePreviewUrl = (id: string) => `/api/resumes/${id}/preview.png`;
