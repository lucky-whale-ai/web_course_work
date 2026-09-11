export class ApiError extends Error {
  constructor(status, data) {
    super(data.message || data.code || "Request failed");
    this.status = status;
    this.data = data;
  }
}
export async function api(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, {
      code: "NETWORK",
      message: "Invalid server response",
    });
  }
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}
