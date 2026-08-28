import { getIdToken } from "./auth";

export type Grant = {
  id?: string;
  name: string;
  organization: string;
  amount: string;
  deadline: string;
  status: string;
  owner: string;
  notes: string;
  createdAt?: string;
};

async function readApiError(response: Response) {
  const text = await response.text();

  if (!text) {
    return response.statusText || "Request failed.";
  }

  try {
    const payload = JSON.parse(text) as { error?: string; message?: string };
    return payload.error || payload.message || text;
  } catch {
    return text;
  }
}

export async function fetchGrants() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  const token = await getIdToken();
  const response = await fetch(`${apiBaseUrl}/grants`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : await readApiError(response),
    );
  }

  const data = (await response.json()) as Grant[];
  return Array.isArray(data) ? data : [];
}

export { readApiError };